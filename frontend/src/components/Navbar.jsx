import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SvgIcon from "./common/SvgIcon";

function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // helper for links/buttons
  const MenuItem = ({ to, children, onClick, gradient, block }) => {
    const baseClass = `transition-all duration-200 font-medium rounded-lg ${
      block ? "block w-full text-center px-4 py-3" : "px-4 py-2"
    } ${
      gradient
        ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg hover:from-rose-500 hover:to-pink-600"
        : "text-purple-100 hover:text-white hover:bg-purple-700/60"
    }`;

    if (to) {
      return (
        <Link to={to} className={baseClass} onClick={onClick}>
          {children}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={baseClass}>
        {children}
      </button>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-800 shadow-xl border-b border-purple-600 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-3"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white text-xl font-bold">Market</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <MenuItem to="/">Accueil</MenuItem>

            {!isLoggedIn ? (
              <>
                <MenuItem to="/login">Connexion</MenuItem>
                <MenuItem to="/register" gradient>
                  S'inscrire
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem to="/profile">Profil</MenuItem>
                <MenuItem to="/offres">Offres</MenuItem>
                <MenuItem to="/settings">Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-purple-100 p-2 rounded-lg hover:bg-purple-700/60 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <SvgIcon pathD="M6 18L18 6M6 6l12 12" />
              ) : (
                <SvgIcon pathD="M4 6h16M4 12h16M4 18h16" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-purple-800/95 border-t border-purple-600 shadow-2xl">
            <div className="px-2 pt-2 pb-4 space-y-2">
              <MenuItem to="/" block onClick={closeMobileMenu}>
                Accueil
              </MenuItem>

              {!isLoggedIn ? (
                <>
                  <MenuItem to="/login" block onClick={closeMobileMenu}>
                    Connexion
                  </MenuItem>
                  <MenuItem
                    to="/register"
                    block
                    gradient
                    onClick={closeMobileMenu}
                  >
                    S'inscrire
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem to="/profile" block onClick={closeMobileMenu}>
                    Profil
                  </MenuItem>
                  <MenuItem onClick={handleLogout} block>
                    Déconnexion
                  </MenuItem>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
