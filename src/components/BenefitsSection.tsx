import React from "react";

const BENEFITS = [
  {
    id: "nourish",
    icon: "💧",
    title: "Nourishes & Conditions Beard",
    desc: "",
  },
  {
    id: "growth",
    icon: "🌱",
    title: "Promotes Healthy Beard Growth",
    desc: "",
  },
  {
    id: "itch",
    icon: "✨",
    title: "Reduces Itchiness & Dandruff",
    desc: "",
  },
  {
    id: "softness",
    icon: "🌿",
    title: "Softness & Adds Natural Shine",
    desc: "",
  },
  {
    id: "moisturize",
    icon: "💧",
    title: "Moisturizes Skin Under Beard",
    desc: "",
  },
  {
    id: "lemon",
    icon: "🍋",
    title: "A burst of refreshing lemon",
    desc: "",
  },
];

const BenefitsSection: React.FC = () => (
  <section className="benefits-section py-5 px-3 px-md-5" id="benefits" aria-labelledby="benefits-heading">
    <div className="section-header text-center mb-5">
      <span className="section-label d-block mb-2">BENEFITS</span>
      <h2 className="section-title serif" id="benefits-heading">
        The Difference
      </h2>
    </div>

    <div className="container-lg p-0">
      <div className="row g-1 g-md-2 row-cols-1 row-cols-md-2 row-cols-lg-3 benefits-grid" role="list">
        {BENEFITS.map((b, i) => (
          <div className="col" key={b.id} role="listitem">
            <div
              className={`benefit-card h-100 reveal reveal-delay-${i + 1}`}
              id={`benefit-${b.id}`}
            >
              <span className="benefit-icon d-block" aria-hidden="true">{b.icon}</span>
              <h3 className="benefit-title">{b.title}</h3>
              {b.desc && <p className="benefit-desc">{b.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;

