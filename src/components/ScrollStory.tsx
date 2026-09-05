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

  const layoutCache = useRef({
    sectionTop: 0,
    sectionH: 0,
    isPortrait: false,
    canvasW: 0,
    canvasH: 0,
  });

  const updateLayoutCache = () => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    layoutCache.current.sectionTop = rect.top + scrollTop;
    layoutCache.current.sectionH = section.offsetHeight - window.innerHeight;
  };

  // Resize canvas accounting for devicePixelRatio
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    layoutCache.current.canvasW = W;
    layoutCache.current.canvasH = H;

    const isPortrait = H > W;
    layoutCache.current.isPortrait = isPortrait; // Cache for panel positioning
    
    const mode = isPortrait ? "mobile" : "desktop";
    const modeChanged = FrameCache.setMode(mode);

    const scaledW = Math.floor(W * dpr);
    const scaledH = Math.floor(H * dpr);

    if (canvas.width !== scaledW || canvas.height !== scaledH || modeChanged) {
      canvas.width = scaledW;
      canvas.height = scaledH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    }
  };

  // Draw frame to canvas using COVER-fit scaling
  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = FrameCache.getFrame(frameIdx);
    if (!img) {
      FrameCache.prioritize(frameIdx); // Ensure it loads if evicted
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = layoutCache.current.canvasW;
    const H = layoutCache.current.canvasH;

    if (W === 0 || H === 0) return;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const isPortrait = H > W;
    const isPortraitFrame = imgH > imgW;
    
    let scale;
    if (isPortrait) {
      if (isPortraitFrame) {
        // We have the correct mobile portrait frame.
        // Use Math.max (cover) to perfectly fill the portrait screen without black bars.
        scale = Math.max(W / imgW, H / imgH);
      } else {
        // Fallback: If we temporarily have a landscape frame in portrait mode (e.g. during rotation),
        // use Math.min (contain) so we don't zoom in 300% and crop out the bottle entirely.
        scale = Math.min(W / imgW, H / imgH);
      }
    } else {
      // Desktop always uses Math.max (cover) to fill screen
      scale = Math.max(W / imgW, H / imgH);
    }

    const drawWidth = imgW * scale;
    const drawHeight = imgH * scale;
    const drawX = (W - drawWidth) / 2;
    const drawY = (H - drawHeight) / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // High-performance single animation loop
  const targetFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  // Helper to calculate opacity and transform based on scrollPct
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

      const translateY = opacity < 0.5 ? 16 : 0;
      
      // Responsive alternating sequence
      let appliedPosition = panel.position;
      if (isPortrait) {
        // Portrait Mobile: TOP -> BOTTOM -> TOP -> BOTTOM
        // Note: CSS class "center" places the panel at the bottom center.
        appliedPosition = i % 2 === 0 ? "top" : "center";
      } else {
        // Desktop / Landscape: LEFT -> RIGHT -> LEFT -> RIGHT
        appliedPosition = i % 2 === 0 ? "left" : "right";
      }
      
      // Directly mutate styles to avoid state updates
      el.className = `scroll-text-panel ${appliedPosition}`;
      el.style.opacity = opacity.toString();
      el.style.pointerEvents = opacity < 0.1 ? "none" : "auto";
      el.style.setProperty('--scroll-ty', `${translateY}px`);
    });
  };

  // Resize + orientation handling
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResizeImmediate = () => {
      updateLayoutCache();
      updateCanvasSize();
      
      // Force panel update on resize/orientation change
      const { sectionTop, sectionH } = layoutCache.current;
      if (sectionH > 0) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const raw = (scrollY - sectionTop) / sectionH;
        updatePanels(Math.max(0, Math.min(1, raw)));
      }

      // Immediately redraw the last drawn frame to prevent blank canvas
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
      // Immediate redraw to prevent black flash
      handleResizeImmediate();
      // Debounced second pass for layout cache accuracy
      resizeTimer = setTimeout(handleResizeImmediate, 100);
    };

    window.addEventListener("resize", handleResize);

    // Handle orientation changes on mobile
    const handleOrientationChange = () => {
      // Orientation changes need a slight delay for viewport to settle
      setTimeout(handleResizeImmediate, 50);
      setTimeout(handleResizeImmediate, 200);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    // ResizeObserver for container-level size changes (address bar, etc.)
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

  // Main scroll + animation loop
  useEffect(() => {
    let ticking = false;

    const renderLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.01) {
        currentFrameRef.current = current + diff * 0.2;
      } else {
        currentFrameRef.current = target;
      }

      const frameToDraw = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current)));

      let nearestFrame = frameToDraw;
      if (!FrameCache.isLoaded(nearestFrame)) {
        const MAX_NEAREST_SEARCH = 15;
        for (let offset = 1; offset <= MAX_NEAREST_SEARCH; offset++) {
          const up = frameToDraw + offset;
          const down = frameToDraw - offset;
          if (up < TOTAL_FRAMES && FrameCache.isLoaded(up)) { nearestFrame = up; break; }
          if (down >= 0 && FrameCache.isLoaded(down)) { nearestFrame = down; break; }
        }
      }

      if (nearestFrame !== lastDrawnFrameRef.current) {
        if (FrameCache.isLoaded(nearestFrame)) {
          drawFrame(nearestFrame);
          lastDrawnFrameRef.current = nearestFrame;
        }
      }

      if (Math.abs(target - currentFrameRef.current) > 0.01) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      } else {
        ticking = false;
      }
    };

    const scheduleRender = () => {
      if (!ticking) {
        ticking = true;
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    const onScroll = () => {
      const { sectionTop, sectionH } = layoutCache.current;
      if (sectionH <= 0) return;

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const raw = (scrollY - sectionTop) / sectionH;
      const pct = Math.max(0, Math.min(1, raw));

      // 1. Direct DOM update for panels (no React state re-render)
      updatePanels(pct);

      // 2. Schedule canvas frame
      const target = Math.round(pct * (TOTAL_FRAMES - 1));
      targetFrameRef.current = target;

      // 3. Prioritize background loading around new target
      FrameCache.prioritize(target);

      scheduleRender();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Subscribe to frame load events — redraw immediately if target frame loaded
    const unsubscribe = FrameCache.subscribe((loadedIdx: number) => {
      const target = targetFrameRef.current;
      // If the just-loaded frame is the current target (or very close), redraw
      if (Math.abs(loadedIdx - target) <= 1) {
        scheduleRender();
      }
    });

    // Attempt initial draw if loaded
    let drawTimer: ReturnType<typeof setTimeout>;
    const initialDraw = () => {
      updateCanvasSize(); // Ensure mode is set before checking isLoaded
      if (FrameCache.isLoaded(0)) {
        updateLayoutCache();
        drawFrame(0);
        updatePanels(0);
      } else {
        FrameCache.prioritize(0); // Trigger load if needed
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

