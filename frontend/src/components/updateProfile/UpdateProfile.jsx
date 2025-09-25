// src/pages/EditProfile.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./../profile/Profile.css";

export default function EditProfile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    adresse: "",
    code_postal: "",
    courriel: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Impossible de charger le profil");

        const u = data.user || data;
        setForm({
          prenom: u.prenom || "",
          nom: u.nom || "",
          adresse: u.adresse || "",
          code_postal: u.code_postal || "",
          courriel: u.courriel || "",
        });
        setLoading(false);
      } catch (e) {
        setError(e.message || "Une erreur est survenue");
        setLoading(false);
      }
    };
    if (isLoggedIn) run();
  }, [isLoggedIn, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => String(v ?? "").trim() !== "")
    );

    try {
      const res = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/users/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mise à jour échouée");

      navigate("/profile", { replace: true });
    } catch (e) {
      setError(e.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn)
    return <div className="profile-container">Vous n’êtes pas connecté.</div>;
  if (loading) return <div className="profile-container">Chargement…</div>;

  return (
    <div className="profile-container">
      <h2>Modifier mon compte</h2>

      {error && (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-row">
          <label>Prénom</label>
          <input
            name="prenom"
            type="text"
            value={form.prenom}
            onChange={onChange}
            placeholder="Prénom"
          />
        </div>

        <div className="form-row">
          <label>Nom</label>
          <input
            name="nom"
            type="text"
            value={form.nom}
            onChange={onChange}
            placeholder="Nom"
          />
        </div>

        <div className="form-row">
          <label>Adresse</label>
          <input
            name="adresse"
            type="text"
            value={form.adresse}
            onChange={onChange}
            placeholder="Adresse"
          />
        </div>

        <div className="form-row">
          <label>Code postal</label>
          <input
            name="code_postal"
            type="text"
            value={form.code_postal}
            onChange={onChange}
            placeholder="H0H 0H0"
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            name="courriel"
            type="email"
            value={form.courriel}
            onChange={onChange}
            placeholder="exemple@mail.com"
          />
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => navigate("/profile")}
            style={{ backgroundColor: "#6c757d" }}
          >
            Annuler
          </button>
          <button type="submit" className="profile-edit-btn" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
