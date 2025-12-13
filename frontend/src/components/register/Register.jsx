import React, { useState } from "react";
import "./Register.css";
import EmailPasswordFields from "../common/EmailPasswordFields";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !pseudo ||
      !adresse ||
      !codePostal
    ) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const response = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/createUser",
        {
          // adapte ce chemin selon ton backend
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prenom: firstName,
            nom: lastName,
            courriel: email,
            password: password,
            pseudo: pseudo,
            adresse: adresse,
            code_postal: codePostal,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPseudo("");
      setAdresse("");
      setCodePostal("");
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>Prénom</label>
        <input
          type="text"
          placeholder="Entrez votre prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label>Nom</label>
        <input
          type="text"
          placeholder="Entrez votre nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label>Pseudo</label>
        <input
          type="text"
          placeholder="Entrez votre Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
        />

        <label>Adresse</label>
        <input
          type="text"
          placeholder="Entrez votre Adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          required
        />

        <label>Code Postal</label>
        <input
          type="text"
          placeholder="Entrez votre Code Postal"
          value={codePostal}
          onChange={(e) => setCodePostal(e.target.value)}
          required
        />

        <EmailPasswordFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}

export default Register;
