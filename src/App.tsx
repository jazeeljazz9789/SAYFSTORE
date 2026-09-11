import React, { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ScrollStory from "./components/ScrollStory";
import ProductSection from "./components/ProductSection";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";

const AppContent: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleLoadDone = useCallback(() => setLoaded(true), []);

  // Lenis smooth scroll engine — desktop only
  useEffect(() => {
    // Respect reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Disable Lenis on mobile/touch: native touch scrolling is already smooth,
    // and Lenis can cause window.scrollY to lag behind the visual scroll position,
    // which breaks the ScrollStory frame synchronization.
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024);
    if (prefersReducedMotion || isMobile) return;

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = undefined;
    };
  }, []);

  return (
    <div id="site-root" className="bg-pitch-black min-h-screen flex flex-col text-stark-white selection:bg-vibrant-red selection:text-stark-white">
      {!loaded && <LoadingScreen onDone={handleLoadDone} />}
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ScrollStory />
        <ProductSection />
      </main>
      {/* We keep the footer but you may want to redesign it as well to match the aesthetic */}
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;

