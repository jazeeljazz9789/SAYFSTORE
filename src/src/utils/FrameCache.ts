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
    
    // Evict all frames that don't match the new mode
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (this.frames[i]) {
        this.frames[i]!.onload = null;
        this.frames[i]!.onerror = null;
        this.frames[i]!.src = "";
      }
      this.frames[i] = null;
      this.states[i] = "unloaded";
    }
    
    this.queue = [];
    return true; // Mode changed
  }
  
  // Track queue
  private queue: number[] = [];
  private activeLoads = 0;
  private MAX_CONCURRENT = 2; // Reduced to prevent network/decoding stutter
  private CACHE_WINDOW = 30; // Keeps +/- 30 frames in memory on desktop
  private lastTargetIdx = -1;
  private scrollDirection = 1; // 1 for down, -1 for up

  // Frame-load event subscribers
  private listeners: ((frameIdx: number) => void)[] = [];

  /** Subscribe to frame-loaded events. Returns an unsubscribe function. */
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

  /**
   * Preload critical frames and return a promise that resolves when they are done.
   */
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

  /**
   * Start progressively loading the rest of the frames in the background.
   */
  public startBackgroundLoad() {
    this.rebuildQueue(0);
    this.processQueue();
  }

  /**
   * Reprioritize the queue based on the user's current scroll frame target.
   * Evicts distant frames and queues nearby frames highest.
   */
  public prioritize(targetIdx: number) {
    // Throttle prioritization: only rebuild queue if target moved significantly
    if (Math.abs(this.lastTargetIdx - targetIdx) < 5) return;
    
    if (this.lastTargetIdx !== -1) {
      this.scrollDirection = targetIdx > this.lastTargetIdx ? 1 : -1;
    }
    
    this.lastTargetIdx = targetIdx;

    if (typeof window !== 'undefined') {
      // Use smaller cache on mobile to prevent RAM crashes
      this.CACHE_WINDOW = window.innerWidth < 768 ? 15 : 30;
    }

    this.evictDistantFrames(targetIdx);
    this.rebuildQueue(targetIdx);
    this.processQueue();
  }
  
  private rebuildQueue(targetIdx: number) {
    const newQueue: number[] = [];
    const queued = new Set<number>();

    // Queue target immediately
    if (targetIdx >= 0 && targetIdx < TOTAL_FRAMES && this.states[targetIdx] === "unloaded") {
      newQueue.push(targetIdx);
      queued.add(targetIdx);
    }

    // Adaptive lookahead windows based on direction
    const forwardLookahead = this.scrollDirection === 1 ? 30 : 10;
    const backwardLookahead = this.scrollDirection === -1 ? 30 : 10;
    const maxOffset = Math.max(forwardLookahead, backwardLookahead);

    for (let offset = 1; offset <= maxOffset; offset++) {
      const up = targetIdx + offset;
      const down = targetIdx - offset;

      if (this.scrollDirection === 1) {
        // Scrolling DOWN (forward)
        if (offset <= forwardLookahead && up < TOTAL_FRAMES && this.states[up] === "unloaded" && !queued.has(up)) {
          newQueue.push(up);
          queued.add(up);
        }
        if (offset <= backwardLookahead && down >= 0 && this.states[down] === "unloaded" && !queued.has(down)) {
          newQueue.push(down);
          queued.add(down);
        }
      } else {
        // Scrolling UP (backward)
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

    this.queue = newQueue;
  }

  private evictDistantFrames(targetIdx: number) {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      // Evict only if fully loaded or errored. 
      // Do not evict 'loading' to prevent orphaned active requests.
      if (this.states[i] === "loaded" || this.states[i] === "error") {
        // Add a hysteresis buffer (+15) so frames don't thrash at the cache boundary
        if (Math.abs(i - targetIdx) > this.CACHE_WINDOW + 15) {
          // Free memory
          if (this.frames[i]) {
            this.frames[i]!.onload = null;
            this.frames[i]!.onerror = null;
            this.frames[i]!.src = ""; 
          }
          this.frames[i] = null;
          this.states[i] = "unloaded";
        }
      }
    }
  }

  private processQueue() {
    if (this.activeLoads >= this.MAX_CONCURRENT || this.queue.length === 0) return;

    while (this.activeLoads < this.MAX_CONCURRENT && this.queue.length > 0) {
      const idx = this.queue.shift();
      if (idx !== undefined && this.states[idx] === "unloaded") {
        this.loadFrame(idx, () => {
          // Schedule next process after current finishes
          setTimeout(() => this.processQueue(), 10); // slight yield to main thread
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
    const reqMode = this.currentMode;
    
    img.onload = () => {
      this.activeLoads--;
      if (this.currentMode !== reqMode) {
        if (onComplete) onComplete();
        return;
      }
      this.frames[idx] = img;
      this.states[idx] = "loaded";
      this.notifyListeners(idx);
      if (onComplete) onComplete();
    };

    img.onerror = () => {
      this.activeLoads--;
      if (this.currentMode !== reqMode) {
        if (onComplete) onComplete();
        return;
      }
      this.states[idx] = "error";
      if (onComplete) onComplete();
    };

    // 1-indexed for the image paths
    img.src = `/images/${reqMode}/ezgif-frame-${this.pad(idx + 1)}.jpg`;
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
