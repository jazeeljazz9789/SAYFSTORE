import React, { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ScrollStory from "./components/ScrollStory";
import ProductSection from "./components/ProductSection";
import BenefitsSection from "./components/BenefitsSection";
import IngredientsSection from "./components/IngredientsSection";
import HowToUseSection from "./components/HowToUseSection";
import StorySection from "./components/StorySection";
import FAQSection from "./components/FAQSection";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";

import CheckoutModal from "./components/CheckoutModal";
import { useCart } from "./context/CartContext";

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { isCheckoutOpen, closeCheckout } = useCart();
  const lenisRef = useRef<Lenis | null>(null);

  const handleLoadingDone = useCallback(() => {
    setLoading(false);
  }, []);

  // Lenis smooth scroll engine
  useEffect(() => {
    if (loading) return;

    // Respect reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 0.8, // Snappier response
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Let smoothTouch default to false so mobile uses native scrolling, preventing the 'floating/laggy' feel
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis; // Expose globally for navigation components

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
  }, [loading]);

  // Pause Lenis when checkout modal is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isCheckoutOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isCheckoutOpen]);

  // Intersection Observer for .reveal elements
  useEffect(() => {
    if (loading) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen onDone={handleLoadingDone} />

      {/* Main site */}
      <div id="site-root" aria-hidden={loading}>
        <Navbar />

        <main>
          <HeroSection />
          <ScrollStory />
          <ProductSection />
          <BenefitsSection />
          <IngredientsSection />
          <HowToUseSection />
          <StorySection />
          <FAQSection />
        </main>

        <Footer />
        <CartDrawer />
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={closeCheckout} />
    </>
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
