import React from "react";

const INGREDIENTS = [
  {
    number: "01",
    name: "Argan Oil",
    desc: "Nourishes the beard and adds a healthy shine.",
  },
  {
    number: "02",
    name: "Almond Oil",
    desc: "Rich in vitamins, helps soften and strengthen the beard hair.",
  },
  {
    number: "03",
    name: "Black Seed Oil",
    desc: "Promotes healthy beard growth and soothes the skin beneath.",
  },
  {
    number: "04",
    name: "Cedar Wood Oil",
    desc: "Improves circulation and provides a premium, masculine scent.",
  },
];

const IngredientsSection: React.FC = () => (
  <section className="ingredients-section py-5 px-3 px-md-5" id="ingredients" aria-labelledby="ingredients-heading">
    <div className="container-lg ingredients-inner p-0">
      <div className="section-header text-center mb-5">
        <span className="section-label d-block mb-2">INGREDIENTS</span>
        <h2 className="section-title serif" id="ingredients-heading">
          The Formula
        </h2>
      </div>

      <div className="row g-1 row-cols-1 row-cols-md-2 ingredients-grid" role="list">
        {INGREDIENTS.map((ing, i) => (
          <div className="col" key={ing.number} role="listitem">
            <div
              className={`ingredient-item h-100 reveal reveal-delay-${(i % 2) + 1}`}
              id={`ingredient-${ing.number}`}
            >
              <div className="ingredient-number" aria-hidden="true">{ing.number}</div>
              <h3 className="ingredient-name">{ing.name}</h3>
              <p className="ingredient-desc mb-0">{ing.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="full-ingredients reveal mt-4 text-center text-md-start" style={{ color: 'var(--silver-dim)', fontSize: '12px', lineHeight: '1.6', letterSpacing: '0.05em' }}>
        <strong>FULL INGREDIENTS:</strong> ARGAN OIL, ALMOND OIL, CEDAR WOOD OIL, ROSEMARY OIL, ONION, BLACK SEED OIL, TEA TREE OI, VITAMIN E.
      </div>
    </div>
  </section>
);

export default IngredientsSection;

