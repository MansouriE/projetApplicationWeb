import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // <-- importe useNavigate
import "./Profile.css";

function Profile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Impossible de charger le profil");
        } else {
          setUser(data.user || data);
        }
      } catch (err) {
        setError("Erreur serveur : " + err.message);
      }
    };

    if (isLoggedIn) fetchProfile();
  }, [token, isLoggedIn]);

  if (!isLoggedIn) {
    return <div className="profile-container">Vous n’êtes pas connecté.</div>;
  }

  if (error) {
    return (
      <div className="profile-container" style={{ color: "crimson" }}>
        {error}
      </div>
    );
  }

  if (!user) {
    return <div className="profile-container">Chargement du profil…</div>;
  }

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>
      <p>
        <strong>Prénom :</strong> {user.prenom}
      </p>
      <p>
        <strong>Nom :</strong> {user.nom}
      </p>
      <p>
        <strong>Adresse :</strong> {user.adresse || "?"}
      </p>
      <p>
        <strong>Code postal :</strong> {user.code_postal || "?"}
      </p>
      <p>
        <strong>Email :</strong> {user.courriel}
      </p>

      <div className="profile-actions">
        <button
          className="profile-edit-btn"
          onClick={() => navigate("/profile/edit")}
        >
          Modifier mon compte
        </button>
      </div>
    </div>
  );
}

export default Profile;
