import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";
import EmailPasswordFields from "../common/EmailPasswordFields";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erreur lors de la connexion");
      } else {
        login(data.token, data.user.id);
        navigate("/profile");
      }
    } catch (error) {
      alert("Erreur serveur : " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <EmailPasswordFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}

export default Login;
