import React, { useState } from "react";
import SAYFLogo from "./SAYFLogo";

interface NavbarProps {}

const NAV_LINKS = [
  { label: "Product", target: "product" },
  { label: "Benefits", target: "benefits" },
  { label: "Ingredients", target: "ingredients" },
  { label: "How to Use", target: "howto" },
  { label: "Our Story", target: "story" },
  { label: "FAQ", target: "faq" },
];

const MenuIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="4" y1="16" x2="20" y2="16" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="navbar position-fixed top-0 start-0 end-0 px-3 px-md-5 d-flex align-items-center justify-content-between" role="navigation" aria-label="Main navigation" style={{ background: "transparent" }}>
      {/* Logo */}
      <div className="navbar-logo flex-shrink-0">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          aria-label="Go to top"
        >
          <SAYFLogo width={80} />
        </button>
      </div>

      {/* Actions */}
      <div className="navbar-actions d-flex align-items-center ms-auto gap-2 gap-sm-3">
        {/* Toggle Menu Button */}
        <button
          className="navbar-menu-btn d-flex align-items-center justify-content-center p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          id="navbar-menu-btn"
        >
          <MenuIcon />
        </button>
        <button
          className="navbar-cta"
          onClick={() => scrollTo("product")}
          id="navbar-order-now"
        >
          Order Now
        </button>
      </div>

      {/* Dropdown Menu */}
      <div className={`navbar-dropdown position-absolute flex-column gap-1${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.target}
            className="navbar-link w-100 text-start"
            onClick={() => scrollTo(link.target)}
            id={`nav-${link.target}`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;

