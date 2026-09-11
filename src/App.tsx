import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";

const AppContent: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);

  // Lenis smooth scroll engine
  useEffect(() => {
    // Respect reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

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
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
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
