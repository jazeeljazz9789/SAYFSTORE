import React from "react";

const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(el);
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };


  return (
    <section className="hero" id="hero" aria-label="Hero">
      {/* Background — first product frame */}
      <div
        className="hero-bg"
        style={{ backgroundImage: "url('/images/desktop/ezgif-frame-001.jpg')" }}
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content">
        <p className="hero-eyebrow">Premium Beard Oil</p>

        <h1 className="hero-headline">SAYF</h1>
        <p className="hero-sub">Store.In</p>

        <p className="hero-tagline">Craft Your Presence.</p>

        <div className="hero-cta-group">
          <button
            className="btn-primary"
            onClick={() => scrollTo("product")}
            id="hero-shop-btn"
          >
            Shop Now
          </button>
          <button
            className="btn-outline"
            onClick={() => scrollTo("story")}
            id="hero-story-btn"
          >
            Our Story
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
};

export default HeroSection;
