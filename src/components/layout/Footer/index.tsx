import React from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp,  
  Mail,
  ExternalLink
} from "lucide-react";
import "../../../styles/layout/_footer.scss";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Dashboard", path: "/" },
    { label: "Watchlist", path: "/watchlist" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "Earnings Calendar", path: "/earnings" },
    { label: "Help", path: "/help" },
  ];

  const resourceLinks = [
    { label: "API Documentation", path: "/docs" },
    { label: "Market News", path: "/news" },
    { label: "Learning Center", path: "/learn" },
    { label: "FAQs", path: "/faqs" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Disclaimer", path: "/disclaimer" },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Main Footer Content */}
        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <TrendingUp className="footer__logo-icon" />
              <span>Equity Lens</span>
            </Link>
            <p className="footer__description">
              Your AI-powered trading intelligence platform. Get real-time market data, 
              portfolio analytics, and personalized investment insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__links-group">
            <h4 className="footer__links-title">Quick Links</h4>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="footer__links-group">
            <h4 className="footer__links-title">Resources</h4>
            <ul className="footer__links">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="footer__links-group">
            <h4 className="footer__links-title">Contact</h4>
            <div className="footer__contact">
              <a href="mailto:support@equitylens.com" className="footer__contact-item">
                <Mail className="footer__contact-icon" />
                <span>support@equitylens.com</span>
              </a>
            </div>
            <h4 className="footer__links-title footer__links-title--mt">Legal</h4>
            <ul className="footer__links">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider"></div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Equity Lens. All rights reserved.
          </p>
          <p className="footer__disclaimer">
            <ExternalLink className="footer__disclaimer-icon" />
            Market data provided for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;