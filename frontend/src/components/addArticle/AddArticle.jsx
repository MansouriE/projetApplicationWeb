import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AddArticle() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [etat, setEtat] = useState("");
  const [acceptsBids, setAcceptsBids] = useState(false);
  const [acceptsOffers, setAcceptsOffers] = useState(false);
  const [startingBid, setStartingBid] = useState("");
  const [bidDuration, setBidDuration] = useState("");
  const [offreReduction, setOffreReduction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const { token, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoggedIn || !token) {
      setError("Vous devez être connecté.");
      return;
    }

    if (!nom || !description || !prix || !etat) {
      setError("Veuillez remplir tous les champs !");
      return;
    }

    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0) {
      setError("Le prix doit être un nombre positif.");
      return;
    }

    if (acceptsBids) {
      if (!startingBid) {
        setError("Veuillez entrer un prix de départ pour les bids !");
        return;
      }
      const startingBidNum = Number(startingBid);
      if (Number.isNaN(startingBidNum) || startingBidNum <= 0) {
        setError("Le prix de départ doit être un nombre positif !");
        return;
      }

      if (!bidDuration) {
        setError("Veuillez sélectionner une durée pour le bid !");
        return;
      }
    }

    const etatsAutorises = ["Neuf", "Bon", "Usagé", "Disponible"];
    if (!etatsAutorises.includes(etat)) {
      setError(`L'état doit être parmi: ${etatsAutorises.join(", ")}`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("prix", prixNum);
      formData.append("etat", etat);
      formData.append("bid", acceptsBids);
      formData.append("offre", acceptsOffers);
      formData.append("offreReduction", acceptsOffers ? offreReduction : "");
      formData.append("bidPrixDepart", acceptsBids ? startingBid : "");
      formData.append("durerBid", acceptsBids ? bidDuration : "");
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/createArticle",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
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

      setNom("");
      setDescription("");
      setPrix("");
      setEtat("");
      setAcceptsBids(false);
      setStartingBid("");
      setBidDuration("");
      setOffreReduction("");
      setAcceptsOffers(false);
      setImageFile(null);

      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la création de l'article");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h3>
          <p className="text-gray-600">Vous devez être connecté pour ajouter un article.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Ajouter un article
        </h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

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

        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mt-1 block w-full"
          />
        </label>

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

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptsBids}
            onChange={(e) => {
              setAcceptsBids(e.target.checked);
              if (e.target.checked) {
                setAcceptsOffers(false);
                setOffreReduction("");
              }
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Autoriser les bids pour cet article</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptsOffers}
            onChange={(e) => {
              setAcceptsOffers(e.target.checked);
              if (e.target.checked) {
                setAcceptsBids(false);
                setBidDuration("");
                setStartingBid("");
              }
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Autoriser les offres pour cet article</span>
        </label>

        {acceptsBids && (
          <>
            <input
              type="number"
              placeholder="Prix de départ des bids"
              value={startingBid}
              onChange={(e) => setStartingBid(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <select
              value={bidDuration}
              onChange={(e) => setBidDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Durée du bid</option>
              <option value="12h">12 heures</option>
              <option value="1d">1 jour</option>
              <option value="2d">2 jours</option>
              <option value="7d">7 jours</option>
              <option value="14d">14 jours</option>
              <option value="30d">30 jours</option>
            </select>
          </>
        )}

        {acceptsOffers && (
          <select
            value={offreReduction}
            onChange={(e) => setOffreReduction(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Réduction %</option>
            <option value="2.5">2.5 %</option>
            <option value="5">5 %</option>
            <option value="10">10 %</option>
            <option value="15">15 %</option>
            <option value="20">20 %</option>
            <option value="25">25 %</option>
          </select>
        )}

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
