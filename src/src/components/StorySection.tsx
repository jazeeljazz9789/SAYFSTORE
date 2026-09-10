import React from "react";

const MANIFESTO = [
  { icon: "⬡", label: "One Product" },
  { icon: "⬡", label: "One Ritual" },
  { icon: "⬡", label: "One Standard" },
];

const StorySection: React.FC = () => (
  <section className="story-section position-relative py-5 px-3 px-md-5 text-center overflow-hidden" id="story" aria-labelledby="story-heading">
    <div className="container-md story-inner position-relative mx-auto" style={{ maxWidth: '700px' }}>
      <span className="section-label d-block mb-4">
        Our Story
      </span>

      <blockquote className="story-quote mb-4" id="story-heading">
        We didn't build a grooming brand.<br />
        <em>We perfected one thing.</em>
      </blockquote>

      <div className="divider mx-auto mb-4" />

      <p className="story-body mb-4">
        SAYF was born from a simple conviction: that a man's beard deserves the very best, 
        and that the very best requires singular focus. We spent years studying the science 
        of beard care, sourcing only the finest cold-pressed oils, and testing on real beards 
        in real conditions.
      </p>

      <p className="story-body mb-5">
        The result is SAYF Premium Beard Oil — the only product we make, and the only one 
        you'll ever need. No compromises. No distractions. Just one exceptional formula, 
        crafted for the man who holds himself to a higher standard.
      </p>

      <div className="story-manifesto d-flex justify-content-center flex-wrap gap-4 gap-md-5" role="list" aria-label="Brand manifesto">
        {MANIFESTO.map((m) => (
          <div className="manifesto-item reveal text-center" role="listitem" key={m.label}>
            <span className="manifesto-item-icon d-block" aria-hidden="true">{m.icon}</span>
            <span className="manifesto-item-label d-block mt-1">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StorySection;

