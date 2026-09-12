import { TOTAL_FRAMES } from "../data/products";

type FrameState = "unloaded" | "loading" | "loaded" | "error";

export class FrameCacheManager {
  private frames: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
  private states: FrameState[] = new Array(TOTAL_FRAMES).fill("unloaded");
  
  private currentMode: "desktop" | "mobile" = "desktop";

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentMode = window.innerHeight > window.innerWidth ? "mobile" : "desktop";
    }
  }

  public setMode(mode: "desktop" | "mobile"): boolean {
    if (this.currentMode === mode) return false;
    this.currentMode = mode;
    
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (this.frames[i]) {
        this.frames[i]!.src = "";
      }
      this.frames[i] = null;
      this.states[i] = "unloaded";
    }
    
    this.queue = [];
    this.activeLoads = 0;
    return true; 
  }
  
  private queue: number[] = [];
  private activeLoads = 0;
  private MAX_CONCURRENT = 4; 
  private CACHE_WINDOW = 60; 
  private lastTargetIdx = -1;
  private scrollDirection = 1;

  private isScrolling = false;
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

  private listeners: ((frameIdx: number) => void)[] = [];

  public subscribe(cb: (frameIdx: number) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(frameIdx: number) {
    for (const cb of this.listeners) cb(frameIdx);
  }
  
  private pad(n: number) {
    return String(n).padStart(3, "0");
  }

  public preloadCritical(
    count: number,
    onProgress: (pct: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      let loaded = 0;
      const targetCount = Math.min(count, TOTAL_FRAMES);

      if (targetCount === 0) return resolve();

      for (let i = 0; i < targetCount; i++) {
        this.loadFrame(i, () => {
          loaded++;
          onProgress(Math.round((loaded / targetCount) * 100));
          if (loaded >= targetCount) {
            resolve();
          }
        });
      }
    });
  }

  public startBackgroundLoad() {
    this.rebuildQueue(0);
    this.processQueue();
  }

  public prioritize(targetIdx: number) {
    if (this.lastTargetIdx === targetIdx) return;
    
    if (this.lastTargetIdx !== -1) {
      this.scrollDirection = targetIdx > this.lastTargetIdx ? 1 : -1;
    }
    
    this.lastTargetIdx = targetIdx;

    if (typeof window !== 'undefined') {
      // Desktop can handle all frames in memory. Mobile uses a larger cache window now to prevent thrashing.
      this.CACHE_WINDOW = window.innerWidth < 768 ? 60 : TOTAL_FRAMES;
    }

    if (this.CACHE_WINDOW < TOTAL_FRAMES) {
      this.evictDistantFrames(targetIdx);
    }
    
    this.isScrolling = true;
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false;
      this.processQueue();
    }, 150);

    this.rebuildQueue(targetIdx);
    this.processQueue();
  }
  
  private rebuildQueue(targetIdx: number) {
    const newQueue: number[] = [];
    const queued = new Set<number>();

    if (targetIdx >= 0 && targetIdx < TOTAL_FRAMES && this.states[targetIdx] === "unloaded") {
      newQueue.push(targetIdx);
      queued.add(targetIdx);
    }

    const forwardLookahead = this.scrollDirection === 1 ? 25 : 10;
    const backwardLookahead = this.scrollDirection === -1 ? 25 : 10;
    const maxOffset = Math.max(forwardLookahead, backwardLookahead);

    for (let offset = 1; offset <= maxOffset; offset++) {
      const up = targetIdx + offset;
      const down = targetIdx - offset;

      if (this.scrollDirection === 1) {
        if (offset <= forwardLookahead && up < TOTAL_FRAMES && this.states[up] === "unloaded" && !queued.has(up)) {
          newQueue.push(up);
          queued.add(up);
        }
        if (offset <= backwardLookahead && down >= 0 && this.states[down] === "unloaded" && !queued.has(down)) {
          newQueue.push(down);
          queued.add(down);
        }
      } else {
        if (offset <= backwardLookahead && down >= 0 && this.states[down] === "unloaded" && !queued.has(down)) {
          newQueue.push(down);
          queued.add(down);
        }
        if (offset <= forwardLookahead && up < TOTAL_FRAMES && this.states[up] === "unloaded" && !queued.has(up)) {
          newQueue.push(up);
          queued.add(up);
        }
      }
    }

    // Prioritize frames closest to the target
    newQueue.sort((a, b) => Math.abs(a - targetIdx) - Math.abs(b - targetIdx));
    this.queue = newQueue;
  }

  private evictDistantFrames(targetIdx: number) {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (this.states[i] === "loaded" || this.states[i] === "error") {
        if (Math.abs(i - targetIdx) > this.CACHE_WINDOW) {
          if (this.frames[i]) {
            this.frames[i]!.src = ""; 
          }
          this.frames[i] = null;
          this.states[i] = "unloaded";
        }
      }
    }
  }

  private processQueue() {
    // Allow 3 concurrent loads while scrolling to prevent starvation, 4 otherwise
    const allowedConcurrent = this.isScrolling ? 3 : this.MAX_CONCURRENT;
    
    // PREEMPTION: Abort distant loading frames if we have high-priority frames waiting
    if (this.queue.length > 0) {
      const highestPriority = this.queue[0];
      
      while (this.activeLoads >= allowedConcurrent) {
        let furthestLoading = -1;
        let maxDist = -1;
        
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (this.states[i] === "loading") {
            const dist = Math.abs(i - this.lastTargetIdx);
            if (dist > maxDist) {
              maxDist = dist;
              furthestLoading = i;
            }
          }
        }
        
        // If the furthest loading frame is further than our highest priority queued frame, abort it
        if (furthestLoading !== -1 && maxDist > Math.abs(highestPriority - this.lastTargetIdx)) {
          if (this.frames[furthestLoading]) {
            this.frames[furthestLoading]!.src = ""; // Aborts the fetch/decode
          }
          this.frames[furthestLoading] = null;
          this.states[furthestLoading] = "unloaded";
          this.activeLoads = Math.max(0, this.activeLoads - 1);
        } else {
          break; // The currently loading frames are higher or equal priority
        }
      }
    }

    if (this.activeLoads >= allowedConcurrent || this.queue.length === 0) return;

    while (this.activeLoads < allowedConcurrent && this.queue.length > 0) {
      const idx = this.queue.shift();
      if (idx !== undefined && this.states[idx] === "unloaded") {
        this.loadFrame(idx, () => {
          this.processQueue(); 
        });
      }
    }
  }

  private loadFrame(idx: number, onComplete?: () => void) {
    if (this.states[idx] !== "unloaded") {
      if (onComplete) onComplete();
      return;
    }

    this.states[idx] = "loading";
    this.activeLoads++;

    const img = new window.Image();
    img.decoding = "async"; // CRITICAL: Prevents main-thread stutter during JPEG decode
    const reqMode = this.currentMode;
    
    img.src = `/images/${reqMode}/ezgif-frame-${this.pad(idx + 1)}.jpg`;

    img.decode()
      .then(() => {
        if (this.currentMode !== reqMode) {
          this.activeLoads--;
          if (onComplete) onComplete();
          return;
        }
        this.activeLoads--;
        this.frames[idx] = img;
        this.states[idx] = "loaded";
        this.notifyListeners(idx);
        if (onComplete) onComplete();
      })
      .catch(() => {
        if (this.currentMode !== reqMode) {
          this.activeLoads--;
          if (onComplete) onComplete();
          return;
        }
        this.activeLoads--;
        this.states[idx] = "error";
        if (onComplete) onComplete();
      });
  }

  public getFrame(idx: number): HTMLImageElement | null {
    if (idx < 0 || idx >= TOTAL_FRAMES) return null;
    return this.frames[idx];
  }
  
  public isLoaded(idx: number): boolean {
    return this.states[idx] === "loaded";
  }
}

export const FrameCache = new FrameCacheManager();
