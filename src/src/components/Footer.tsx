import React from "react";
import SAYFLogo from "./SAYFLogo";

interface FooterProps { }

const Footer: React.FC<FooterProps> = () => {
  const scrollTo = (id: string | null) => {
    if (!id) return;
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
    <footer className="footer py-5 px-3 px-md-5" role="contentinfo">
      <div className="container-lg footer-main border-bottom pb-5 p-0">
        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4">
          {/* Brand */}
          <div className="col footer-brand">
            <SAYFLogo width={110} />
            <p className="footer-tagline mt-2">Craft Your Presence.</p>
            <div className="footer-contact mt-3" style={{ color: 'var(--silver-dim)', fontSize: '12px', lineHeight: '1.8' }}>
              <strong style={{ color: 'var(--silver)', letterSpacing: '0.1em' }}>MARKETED BY:</strong><br />
              SAYF STORE.IN<br />
              Email: sayfstore.in@gmail.com<br />
              Phone: 9944282594<br />
              Address: Thiruvithancode, Kanniyakumari,<br />Tamil Nadu
            </div>
          </div>

          {/* Link Column 1: Product */}
          <div className="col">
            <div className="footer-col-title mb-3">Product</div>
            <ul className="footer-links list-unstyled d-flex flex-column gap-2 p-0" role="list">
              <li><button className="footer-link border-0 bg-transparent p-0 text-start" onClick={() => scrollTo("product")}>Beard Oil</button></li>
              <li><button className="footer-link border-0 bg-transparent p-0 text-start" onClick={() => scrollTo("benefits")}>Benefits</button></li>
              <li><button className="footer-link border-0 bg-transparent p-0 text-start" onClick={() => scrollTo("ingredients")}>Ingredients</button></li>
              <li><button className="footer-link border-0 bg-transparent p-0 text-start" onClick={() => scrollTo("howto")}>How to Use</button></li>
            </ul>
          </div>
          {/* Link Column 2: Customer Care */}
          <div className="col">
            <div className="footer-col-title mb-3">Customer Support</div>

            <ul
              className="footer-links list-unstyled d-flex flex-column gap-2 p-0"
              role="list"
            >
              <li>
                <a
                  href="https://api.whatsapp.com/send?phone=919944282594&text=Hi%20SAYF%20Store%2C%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link d-flex align-items-center"
                  style={{
                    color: "#6d6e6eff",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  {/* WhatsApp Logo */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="me-2"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.89a11.821 11.821 0 00-3.478-8.416" />
                  </svg>

                  WhatsApp
                </a>
              </li>

              <li>
                <button
                  className="footer-link border-0 bg-transparent p-0 text-start"
                  onClick={() => scrollTo("faq")}
                >
                  FAQ
                </button>
              </li>

              <li>
                <button
                  className="footer-link border-0 bg-transparent p-0 text-start"
                  onClick={() => scrollTo("story")}
                >
                  Our Story
                </button>
              </li>
            </ul>
          </div>

          {/* Link Column 3: Contact */}
          <div className="col">
            <div className="footer-col-title mb-3">Social & Connect</div>

            <ul
              className="footer-links list-unstyled d-flex flex-column gap-2 p-0"
              role="list"
            >
              <li>
                <a
                  href="https://www.instagram.com/sayfstore.in?igsi=MXF6YTQ0ejUyN2tqbA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link d-flex align-items-center"
                  style={{
                    textDecoration: "none",
                    color: "#6d6e6eff",
                  }}
                >
                  {/* Instagram Logo */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-2"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>

                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="container-lg footer-bottom pt-4 d-flex flex-column flex-sm-row align-items-center justify-content-between text-center text-sm-start gap-3 p-0">
            <p className="footer-copy mb-0">
              © {new Date().getFullYear()} SAYF Store.In — All rights reserved.
            </p>
            <p className="footer-copy mb-0" style={{ letterSpacing: "0.3em" }}>
              ONE BRAND. ONE PRODUCT. ONE STANDARD.
            </p>
          </div>
        </footer>
        );
};

        export default Footer;

