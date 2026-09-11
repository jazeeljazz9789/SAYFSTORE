import React, { useEffect, useRef } from "react";
import { TOTAL_FRAMES } from "../data/products";
import { FrameCache } from "../utils/FrameCache";

// --- Scroll Story Panels ---
type PanelPosition = "top" | "center" | "left" | "right" | string;

interface PanelDef {
  id: string;
  startPct: number;
  endPct: number;
  position: PanelPosition;
  label: string;
  title: string;
  sub: string;
}

const PANELS: PanelDef[] = [
  {
    id: "meet",
    startPct: 0,
    endPct: 0.18,
    position: "top",
    label: "Introducing",
    title: "MEET SAYF.",
    sub: "",
  },
  {
    id: "reveal",
    startPct: 0.18,
    endPct: 0.36,
    position: "left",
    label: "",
    title: "PREMIUM\nBEARD OIL.",
    sub: "One product. Perfected.",
  },
  {
    id: "purpose",
    startPct: 0.36,
    endPct: 0.54,
    position: "bottom",
    label: "",
    title: "MADE FOR THE\nMODERN BEARD.",
    sub: "Engineered for those who demand more.",
  },
  {
    id: "benefits",
    startPct: 0.54,
    endPct: 0.72,
    position: "bottom",
    label: "",
    title: "SOFT.\nNOURISHED.\nREFINED.",
    sub: "",
  },
];

const ScrollStory: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Array of refs to directly manipulate text panels without React re-renders
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentFrameRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  // Continuous scroll progress (0–1) — NOT quantized to frame boundaries
  const scrollProgressRef = useRef(0);

  const layoutCache = useRef({
    sectionTop: 0,
    sectionH: 0,
    isPortrait: false,
    canvasW: 0,
    canvasH: 0,
    drawX: 0,
    drawY: 0,
    drawWidth: 0,
    drawHeight: 0,
    metricsCalculated: false,
    initialMobileHeight: -1,
    layoutDirty: true, // Forces re-measurement on first scroll
  });

  // Track DOM state in JS to prevent DOM reads and string allocations
  const panelStateCache = useRef(PANELS.map(() => ({ opacity: -1, className: "", pointer: "", ty: "" })));

  const updateLayoutCache = () => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    layoutCache.current.sectionTop = rect.top + scrollTop;
    
    // Lock viewport height on mobile so URL bar changes don't shift the scroll percentage
    let h = window.innerHeight;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (layoutCache.current.initialMobileHeight === -1) {
        layoutCache.current.initialMobileHeight = h;
      }
      h = layoutCache.current.initialMobileHeight;
    } else {
      layoutCache.current.initialMobileHeight = -1; // Reset if resized to desktop
    }
    
    layoutCache.current.sectionH = section.offsetHeight - h;
    layoutCache.current.layoutDirty = false;
  };

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    layoutCache.current.canvasW = W;
    layoutCache.current.canvasH = H;

    const isPortrait = H > W;
    layoutCache.current.isPortrait = isPortrait; 
    
    const mode = isPortrait ? "mobile" : "desktop";
    const modeChanged = FrameCache.setMode(mode);

    const scaledW = Math.floor(W * dpr);
    const scaledH = Math.floor(H * dpr);

    if (canvas.width !== scaledW || canvas.height !== scaledH || modeChanged) {
      canvas.width = scaledW;
      canvas.height = scaledH;
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      layoutCache.current.metricsCalculated = false; // Force recalc of draw metrics on next frame
    }
  };

  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = FrameCache.getFrame(frameIdx);
    if (!img) {
      FrameCache.prioritize(frameIdx); 
      return;
    }

    const ctx = ctxRef.current;
    if (!ctx) return;

    const W = layoutCache.current.canvasW;
    const H = layoutCache.current.canvasH;

    if (W === 0 || H === 0) return;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    if (imgW === 0 || imgH === 0) return;

    // Calculate dimensions only once per resize/orientation change
    if (!layoutCache.current.metricsCalculated) {
      const isPortrait = H > W;
      const isPortraitFrame = imgH > imgW;
      
      let scale;
      if (isPortrait) {
        if (isPortraitFrame) {
          scale = Math.max(W / imgW, H / imgH);
        } else {
          scale = Math.min(W / imgW, H / imgH);
        }
      } else {
        scale = Math.max(W / imgW, H / imgH);
      }

      layoutCache.current.drawWidth = imgW * scale;
      layoutCache.current.drawHeight = imgH * scale;
      layoutCache.current.drawX = (W - layoutCache.current.drawWidth) / 2;
      layoutCache.current.drawY = (H - layoutCache.current.drawHeight) / 2;
      layoutCache.current.metricsCalculated = true;
    }

    ctx.drawImage(
      img, 
      layoutCache.current.drawX, 
      layoutCache.current.drawY, 
      layoutCache.current.drawWidth, 
      layoutCache.current.drawHeight
    );
  };

  const targetFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  const updatePanels = (pct: number) => {
    const { isPortrait } = layoutCache.current;
    
    PANELS.forEach((panel, i) => {
      const el = panelRefs.current[i];
      if (!el) return;

      let opacity = 0;
      if (pct >= panel.startPct && pct <= panel.endPct) {
        const dur = panel.endPct - panel.startPct;
        const fadeLen = Math.min(0.06, dur * 0.25);
        if (pct < panel.startPct + fadeLen) {
          opacity = (pct - panel.startPct) / fadeLen;
        } else if (pct > panel.endPct - fadeLen) {
          opacity = (panel.endPct - pct) / fadeLen;
        } else {
          opacity = 1;
        }
      }

      // Fast-path cache diffing to prevent DOM layout thrashing
      const state = panelStateCache.current[i];
      
      const newClassName = `scroll-text-panel ${isPortrait ? (i % 2 === 0 ? "top" : "center") : (i % 2 === 0 ? "left" : "right")}`;
      if (state.className !== newClassName) {
        state.className = newClassName;
        el.className = newClassName;
      }
      
      // Throttle opacity updates slightly to avoid string allocs if change is negligible
      if (Math.abs(state.opacity - opacity) > 0.01 || (opacity === 0 && state.opacity !== 0) || (opacity === 1 && state.opacity !== 1)) {
        state.opacity = opacity;
        el.style.opacity = String(opacity);
      }
      
      const newPointer = opacity < 0.1 ? "none" : "auto";
      if (state.pointer !== newPointer) {
        state.pointer = newPointer;
        el.style.pointerEvents = newPointer;
      }
      
      const translateY = opacity < 0.5 ? 16 : 0;
      const newTy = `${translateY}px`;
      if (state.ty !== newTy) {
        state.ty = newTy;
        el.style.setProperty('--scroll-ty', newTy);
      }
    });
  };

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResizeImmediate = () => {
      updateLayoutCache();
      updateCanvasSize();
      
      const { sectionTop, sectionH } = layoutCache.current;
      if (sectionH > 0) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const raw = (scrollY - sectionTop) / sectionH;
        updatePanels(Math.max(0, Math.min(1, raw)));
      }

      const lastFrame = lastDrawnFrameRef.current;
      if (lastFrame >= 0) {
        if (FrameCache.isLoaded(lastFrame)) {
          drawFrame(lastFrame);
        } else {
          FrameCache.prioritize(lastFrame);
        }
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      layoutCache.current.layoutDirty = true; // Mark for re-measurement on next scroll
      handleResizeImmediate();
      resizeTimer = setTimeout(handleResizeImmediate, 100);
    };

    window.addEventListener("resize", handleResize);

    const handleOrientationChange = () => {
      layoutCache.current.initialMobileHeight = -1; // Reset to recalculate new orientation height
      layoutCache.current.layoutDirty = true;
      setTimeout(handleResizeImmediate, 50);
      setTimeout(handleResizeImmediate, 200);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    let resizeObserver: ResizeObserver | null = null;
    const canvas = canvasRef.current;
    if (canvas && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResizeImmediate();
      });
      resizeObserver.observe(canvas);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const renderFrame = () => {
      const target = targetFrameRef.current;
      currentFrameRef.current = target;

      let nearestFrame = target;
      if (!FrameCache.isLoaded(nearestFrame)) {
        const last = lastDrawnFrameRef.current;
        if (last >= 0) {
          if (target > last) {
            // Scrolling forwards: search backwards from target down to last drawn
            for (let i = target - 1; i >= last; i--) {
              if (FrameCache.isLoaded(i)) {
                nearestFrame = i;
                break;
              }
            }
          } else if (target < last) {
            // Scrolling backwards: search forwards from target up to last drawn
            for (let i = target + 1; i <= last; i++) {
              if (FrameCache.isLoaded(i)) {
                nearestFrame = i;
                break;
              }
            }
          }
          // If we couldn't find ANY loaded frame between target and last, fall back to last
          if (!FrameCache.isLoaded(nearestFrame)) {
            nearestFrame = last;
          }
        } else {
          // Fallback if we haven't drawn anything yet
          for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
            const up = target + offset;
            const down = target - offset;
            if (up < TOTAL_FRAMES && FrameCache.isLoaded(up)) { nearestFrame = up; break; }
            if (down >= 0 && FrameCache.isLoaded(down)) { nearestFrame = down; break; }
          }
        }
      }

      if (nearestFrame !== lastDrawnFrameRef.current) {
        if (FrameCache.isLoaded(nearestFrame)) {
          drawFrame(nearestFrame);
          lastDrawnFrameRef.current = nearestFrame;
        }
      }
      
      ticking = false;
    };

    // Combined update: panels always use continuous scroll progress, canvas uses frame index
    const updateCanvasAndPanels = () => {
      // Panels use the CONTINUOUS scroll progress (smooth fade, no quantized jumps)
      updatePanels(scrollProgressRef.current);
      renderFrame();
    };

    const scheduleRender = () => {
      if (!ticking) {
        ticking = true;
        animFrameRef.current = requestAnimationFrame(() => {
          renderFrame();
        });
      }
    };

    const onScroll = () => {
      // Re-measure layout if marked dirty (resize, orientation change, initial)
      if (layoutCache.current.layoutDirty) {
        updateLayoutCache();
      }

      const { sectionTop, sectionH } = layoutCache.current;
      if (sectionH <= 0) return;

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const raw = (scrollY - sectionTop) / sectionH;
      const pct = Math.max(0, Math.min(1, raw));

      // Store continuous progress — this is what panels use for smooth fading
      scrollProgressRef.current = pct;

      const target = Math.round(pct * (TOTAL_FRAMES - 1));

      // Always update panels (they use continuous pct, not quantized frame index)
      // Only re-prioritize frame loading when the target frame actually changes
      if (target !== targetFrameRef.current) {
        targetFrameRef.current = target;
        FrameCache.prioritize(target);
      }
      
      // Execute synchronously! iOS Safari throttles requestAnimationFrame during native touch scrolls.
      // Synchronous execution in the passive scroll event is the ONLY way to track the finger 1:1.
      updateCanvasAndPanels();
    };

    // Use native passive scroll listener universally.
    // On mobile: captures butter-smooth compositor events directly.
    // On desktop: Lenis smooth scroll translates to window.scrollTo, natively triggering this.
    window.addEventListener("scroll", onScroll, { passive: true });

    const unsubscribe = FrameCache.subscribe((loadedIdx: number) => {
      const target = targetFrameRef.current;
      if (Math.abs(loadedIdx - target) <= 2) {
        // Background loads use RAF so they don't block the main thread
        scheduleRender();
      }
    });

    let drawTimer: ReturnType<typeof setTimeout>;
    const initialDraw = () => {
      updateCanvasSize(); 
      if (FrameCache.isLoaded(0)) {
        updateLayoutCache();
        drawFrame(0);
        updatePanels(0);
      } else {
        FrameCache.prioritize(0); 
        drawTimer = setTimeout(initialDraw, 50);
      }
    };
    initialDraw();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (drawTimer) clearTimeout(drawTimer);
      unsubscribe();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${TOTAL_FRAMES * 20}px` }}
      aria-label="Product reveal animation"
    >
      <div className="scroll-story-sticky">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="scroll-story-canvas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {/* Dark vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Text panels */}
        {PANELS.map((panel, i) => (
          <div
            key={panel.id}
            ref={(el) => { panelRefs.current[i] = el; }}
            className={`scroll-text-panel ${panel.position}`}
            style={{
              opacity: 0,
              pointerEvents: "none",
              transition: "none", // We handle the lerp in the scroll event natively
            }}
          >
            {panel.label && (
              <div className="scroll-panel-label">{panel.label}</div>
            )}
            <div className="scroll-panel-title">
              {panel.title.split("\n").map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < panel.title.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            {panel.sub && (
              <div className="scroll-panel-sub">{panel.sub}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ScrollStory;

