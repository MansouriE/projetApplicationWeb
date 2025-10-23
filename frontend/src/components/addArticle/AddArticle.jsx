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

    const etatsAutorises = ["Neuf", "Bon", "Usagé", "Disponible"];
    if (!etatsAutorises.includes(etat)) {
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom,
            description,
            prix: prixNum,
            etat,
          }),
        }
      );

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

      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("❌ Erreur : " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Ajouter un article
        </h2>

        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none h-28 resize-none"
        />

        <input
          type="number"
          placeholder="Prix"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <select
          value={etat}
          onChange={(e) => setEtat(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Sélectionner l'état</option>
          <option value="Neuf">Neuf</option>
          <option value="Bon">Bon</option>
          <option value="Usagé">Usagé</option>
          <option value="Disponible">Disponible</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Création..." : "Créer l'article"}
        </button>
      </form>
    </div>
  );
}

export default AddArticle;