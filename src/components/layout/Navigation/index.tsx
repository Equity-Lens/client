import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/layout/_header.scss";

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/watchlist", label: "Watchlist" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/earnings-calendar", label: "Earnings Calendar" },
    { path: "/trading-intelligence", label: "Help" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            Equity Lens
          </Link>
        </div>

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Section */}
        <div className="nav-auth">
          {isAuthenticated && user ? (
            // User Menu (when logged in)
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                <ChevronDown
                  className={`user-chevron ${showUserMenu ? "rotate" : ""}`}
                />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="dropdown-icon" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="dropdown-icon" />
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <LogOut className="dropdown-icon" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Sign In Button (when logged out)
            <Link to="/auth/signin" className="btn-signin">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
