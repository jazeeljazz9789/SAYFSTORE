import React, { useState } from "react";

const FAQS = [
  {
    q: "How often should I use SAYF Beard Oil?",
    a: "We recommend using SAYF Beard Oil once daily — ideally after a shower or wash when your beard is clean and slightly damp. This maximises absorption and ensures your beard stays conditioned throughout the day.",
  },
  {
    q: "How many drops should I use?",
    a: "Start with 3–5 drops for a short beard, 6–10 for a medium beard, and up to 15 for a longer, denser beard. The oil is highly concentrated, so a little goes a long way.",
  },
  {
    q: "Will it make my beard feel greasy?",
    a: "Not at all. SAYF is formulated with lightweight, fast-absorbing carrier oils that leave zero greasiness or residue. Your beard will feel soft, hydrated, and completely natural — never oily.",
  },
  {
    q: "Is SAYF suitable for all skin types?",
    a: "Yes. SAYF is 100% natural and free from synthetic fragrances, parabens, and sulfates. It is gentle on all skin types, including sensitive skin. However, if you have a known allergy to any of the listed ingredients, please consult a professional before use.",
  },
  {
    q: "How long does one bottle last?",
    a: "At the recommended daily usage, one 30ml bottle typically lasts 4–6 weeks depending on beard length. For longer beards, consider our 2 or 3 bottle options for uninterrupted ritual.",
  },
  {
    q: "What is your return policy?",
    a: "We offer hassle-free returns within 15 days of delivery if you are not completely satisfied. Simply contact our support team and we will guide you through the process.",
  },
];

const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="faq-section py-5 px-3 px-md-5" id="faq" aria-labelledby="faq-heading">
      <div className="section-header text-center mb-5">
        <span className="section-label d-block mb-2">Got Questions?</span>
        <h2 className="section-title serif" id="faq-heading">
          FAQ
        </h2>
      </div>

      <div className="container-md faq-list p-0 mx-auto" style={{ maxWidth: '760px' }} role="list">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className={`faq-item${openIdx === i ? " open" : ""}`}
            role="listitem"
            id={`faq-item-${i + 1}`}
          >
            <button
              className="faq-question w-100 d-flex align-items-center justify-content-between gap-3 text-start border-0 py-3"
              onClick={() => toggle(i)}
              aria-expanded={openIdx === i}
              aria-controls={`faq-answer-${i + 1}`}
              id={`faq-question-${i + 1}`}
            >
              <span className="faq-question-text">{faq.q}</span>
              <span className="faq-icon flex-shrink-0" aria-hidden="true" />
            </button>

            <div
              className="faq-answer"
              id={`faq-answer-${i + 1}`}
              role="region"
              aria-labelledby={`faq-question-${i + 1}`}
            >
              <p className="faq-answer-text">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;

