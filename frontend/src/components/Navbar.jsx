import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
            <Link 
              to="/" 
              className="text-purple-100 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60"
            >
              Accueil
            </Link>
            
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login" 
                  className="text-purple-100 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  S'inscrire
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="text-purple-100 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60"
                >
                  Profil
                </Link>
                <Link 
                  to="/offres" 
                  className="text-purple-100 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60"
                >
                  Offres
                </Link>
                <Link 
                  to="/settings" 
                  className="text-purple-100 hover:text-white font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60"
                >
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-purple-100 hover:text-rose-200 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-purple-700/60 border border-purple-500 hover:border-rose-400"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-purple-100 p-2 rounded-lg hover:bg-purple-700/60 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-purple-800/95 border-t border-purple-600 shadow-2xl">
            <div className="px-2 pt-2 pb-4 space-y-2">
              <Link 
                to="/" 
                className="text-purple-100 block px-4 py-3 rounded-lg hover:bg-purple-700/60 transition-all duration-200 font-medium"
                onClick={closeMobileMenu}
              >
                Accueil
              </Link>
              
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-purple-100 block px-4 py-3 rounded-lg hover:bg-purple-700/60 transition-all duration-200 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-rose-400 to-pink-500 text-white block px-4 py-3 rounded-lg font-medium text-center shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    S'inscrire
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/profile" 
                    className="text-purple-100 block px-4 py-3 rounded-lg hover:bg-purple-700/60 transition-all duration-200 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Profil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-rose-200 block w-full text-left px-4 py-3 rounded-lg hover:bg-rose-500/20 transition-all duration-200 font-medium border border-rose-400/30"
                  >
                    Déconnexion
                  </button>
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