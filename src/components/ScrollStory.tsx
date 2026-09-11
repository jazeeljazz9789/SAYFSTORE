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

    const drawWidth = imgW * scale;
    const drawHeight = imgH * scale;
    const drawX = (W - drawWidth) / 2;
    const drawY = (H - drawHeight) / 2;

    // We don't need clearRect because { alpha: false } makes it opaque and we cover the whole bounds.
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
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

      const translateY = opacity < 0.5 ? 16 : 0;
      
      let appliedPosition = panel.position;
      if (isPortrait) {
        appliedPosition = i % 2 === 0 ? "top" : "center";
      } else {
        appliedPosition = i % 2 === 0 ? "left" : "right";
      }
      
      const newClassName = `scroll-text-panel ${appliedPosition}`;
      if (el.className !== newClassName) el.className = newClassName;
      
      const newOpacity = opacity.toFixed(3);
      if (el.style.opacity !== newOpacity) el.style.opacity = newOpacity;
      
      const newPointer = opacity < 0.1 ? "none" : "auto";
      if (el.style.pointerEvents !== newPointer) el.style.pointerEvents = newPointer;
      
      const newTy = `${translateY}px`;
      if (el.style.getPropertyValue('--scroll-ty') !== newTy) el.style.setProperty('--scroll-ty', newTy);
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
      handleResizeImmediate();
      resizeTimer = setTimeout(handleResizeImmediate, 100);
    };

    window.addEventListener("resize", handleResize);

    const handleOrientationChange = () => {
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

    const renderLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current = current + diff * 0.4;
      } else {
        currentFrameRef.current = target;
      }
      
      const currentPct = currentFrameRef.current / (TOTAL_FRAMES - 1);
      updatePanels(currentPct);

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

      const target = Math.round(pct * (TOTAL_FRAMES - 1));
      targetFrameRef.current = target;

      FrameCache.prioritize(target);

      scheduleRender();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const unsubscribe = FrameCache.subscribe((loadedIdx: number) => {
      const target = targetFrameRef.current;
      if (Math.abs(loadedIdx - target) <= 1) {
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

