import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AddArticle() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [etat, setEtat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { token, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !token) {
      alert("Vous devez être connecté.");
      return;
    }

    if (!nom || !description || !prix || !etat) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0) {
      alert("Le prix doit être un nombre positif.");
      return;
    }

    // (optionnel) Valider l’enum côté front
    const etatsAutorises = ["Neuf", "Bon", "Usagé", "Disponible"];
    if (!etatsAutorises.includes(etat)) {
      // adapte à tes vraies valeurs d’enum
      alert(`L'état doit être parmi: ${etatsAutorises.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/createArticle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // utile si ton API le requiert
          },
          body: JSON.stringify({
            nom,
            description,
            prix: prixNum, // envoie un nombre
            etat,
          }),
        }
      );

      // Lis TOUJOURS le corps en texte, puis parse si c'est JSON
      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();
      const data = contentType.includes("application/json")
        ? JSON.parse(rawText)
        : null;

      if (!response.ok) {
        const msg = data?.error || rawText || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      alert("✅ Article créé avec succès !");
      setNom("");
      setDescription("");
      setPrix("");
      setEtat("");

      // Redirection (ajuste la route selon ton app)
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("❌ Erreur : " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        type="number"
        placeholder="Prix"
        value={prix}
        onChange={(e) => setPrix(e.target.value)}
      />
      <br />
      {/* Idéalement un <select> pour un enum */}
      <input
        type="text"
        placeholder="État (ex: Neuf)"
        value={etat}
        onChange={(e) => setEtat(e.target.value)}
      />
      <br />
      <button type="submit" disabled={submitting}>
        {submitting ? "Création..." : "Créer l’article"}
      </button>
    </form>
  );
}

export default AddArticle;
