import React from "react";
import Navbar from "./components/Navbar";
import Login from "./components/login/Login"; // Vérifie la majuscule "Login" si le fichier s'appelle "Login.jsx"

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ marginTop: "100px", textAlign: "center" }}>
        <h1>Bienvenue sur la page d’accueil</h1>
        <p>Ceci est une app React avec une barre de navigation en haut.</p>

        {/* Affichage du formulaire de connexion */}
        <Login />
      </div>
    </div>
  );
}

export default App;
