import React from "react";

const HowToUseSection: React.FC = () => (
  <section className="howto-section py-5 px-3 px-md-5" id="howto" aria-labelledby="howto-heading">
    <div className="section-header text-center mb-5">
      <span className="section-label d-block mb-2">HOW TO USE</span>
      <h2 className="section-title serif" id="howto-heading">
        The Ritual
      </h2>
    </div>

    <div className="howto-content reveal text-center mx-auto" style={{ maxWidth: '600px' }}>
      <p style={{ color: 'var(--silver)', fontSize: '16px', lineHeight: '1.8' }}>
        Dispense a few drops into your palm, rub between two hands, and apply evenly to your beard and skin. Use daily for best results.
      </p>
    </div>

    <div className="claim-icons reveal reveal-delay-2 d-flex justify-content-center flex-wrap gap-4 mt-5">
      {[
        { label: '100%\nNATURAL', icon: '🌿' },
        { label: 'PARABEN\nFREE', icon: '🧪' },
        { label: 'CRUELTY\nFREE', icon: '🐰' },
        { label: 'SILICONE\nFREE', icon: '💧' },
      ].map((claim, i) => (
        <div key={i} className="d-flex flex-column align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--graphite)', fontSize: '24px' }}>
            {claim.icon}
          </div>
          <span className="text-center" style={{ fontSize: '10px', color: 'var(--silver-dim)', letterSpacing: '0.1em', whiteSpace: 'pre-line' }}>{claim.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default HowToUseSection;

