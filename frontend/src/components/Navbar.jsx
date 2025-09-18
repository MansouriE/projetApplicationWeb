import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">MyApp</div>
        <ul className="navbar-links">
          <li>
            <a href="#">Accueil</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
