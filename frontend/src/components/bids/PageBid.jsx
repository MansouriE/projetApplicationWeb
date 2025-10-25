import React, { useEffect, useMemo, useState, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://projetapplicationweb-1.onrender.com";

function PageBid() {
  const { id } = useParams();
  const { state } = useLocation();
  const article = state;

  const { token: ctxToken } = useContext(AuthContext) || {};
  const token = ctxToken || localStorage.getItem("token") || "";

  const [bids, setBids] = useState([]);
  const [bidMontant, setBidMontant] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const prixDepart = Number(
    (article && (article.bidPrixDeDepart ?? article.prix)) || 0
  );

  const prixCourant = useMemo(() => {
    const maxBid = bids.length
      ? Math.max(...bids.map((b) => Number(b.amount)))
      : 0;
    return Math.max(prixDepart, maxBid);
  }, [bids, prixDepart]);

  // --- util: fetch des bids pour l'article
  const fetchBids = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/bids?article_id=${id}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Réponse non-JSON: ${raw.slice(0, 120)}`);
      }
      if (!res.ok) throw new Error(data?.error || "Erreur chargement bids");
      setBids(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage(e.message || "Erreur chargement bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids(); /* au mount et quand id change */
  }, [id]);

  const faireUnBid = async (e) => {
    e.preventDefault();
    setMessage("");

    const montant = Number(bidMontant);
    if (!Number.isFinite(montant))
      return setMessage("Entrez un nombre valide.");
    if (montant <= prixCourant)
      return setMessage(`💡 Le bid doit être > ${prixCourant}.`);
    if (!token) return setMessage("⛔ Vous devez être connecté.");

    try {
      const res = await fetch(`${API_BASE}/api/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // usr_id déduit du token côté backend
        },
        body: JSON.stringify({ article_id: Number(id), amount: montant }),
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Réponse non-JSON: ${raw.slice(0, 120)}`);
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error("⛔ Session expirée. Veuillez vous reconnecter.");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors du bid");
      }

      // ✅ re-fetch pour afficher la vraie liste triée par le serveur
      await fetchBids();
      setBidMontant("");
      setMessage(`✅ Bid de ${montant} $ placé.`);
    } catch (e) {
      setMessage(e.message || "Erreur réseau");
    }
  };

  if (!article) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Aucun article trouvé. Ouvrez la page depuis la liste.
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10 border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{article.nom}</h1>
      <p className="text-gray-600 mb-6">{article.description}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="text-xl font-semibold text-green-700">
          Prix de départ : {prixDepart} $
        </span>
        <span className="text-lg font-semibold">
          Prix actuel : {prixCourant} $
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            article.etat === "Neuf"
              ? "bg-green-100 text-green-800"
              : article.etat === "Bon état"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {article.etat}
        </span>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Bids</h2>
        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : bids.length ? (
          <ul className="space-y-2">
            {[...bids]
              .sort((a, b) => Number(b.amount) - Number(a.amount))
              .map((bid) => (
                <li
                  key={bid.id}
                  className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-700">
                    Utilisateur #{bid.usr_id ?? "?"}
                  </span>
                  <span className="text-green-700 font-semibold">
                    {Number(bid.amount)} $
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucun bid pour l’instant</p>
        )}
      </div>

      <form onSubmit={faireUnBid} className="space-y-3">
        <label className="block text-gray-700 font-medium">Nouveau bid :</label>
        <input
          type="number"
          step="0.01"
          min={0}
          value={bidMontant}
          onChange={(e) => setBidMontant(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={`> ${prixCourant}`}
        />
        <button
          type="submit"
          disabled={
            !bidMontant ||
            Number(bidMontant) <= prixCourant ||
            !Number.isFinite(Number(bidMontant))
          }
          className={`w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200
            ${
              !bidMontant ||
              Number(bidMontant) <= prixCourant ||
              !Number.isFinite(Number(bidMontant))
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          Placer le bid
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>
      )}
    </div>
  );
}

export default PageBid;
