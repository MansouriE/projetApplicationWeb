import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

function PageBid() {
  const { id } = useParams();
  const { state } = useLocation();
  const article = state;

  const [bids, setBids] = useState([]);
  const [bidMontant, setBidMontant] = useState("");
  const [message, setMessage] = useState("");

  const faireUnBid = (e) => {
    e.preventDefault();

    if (!bidMontant || isNaN(bidMontant)) {
      setMessage("Entrez un nombre valide");
      return;
    }

    const currentMax = Math.max(article.prix, ...bids.map((b) => b.amount));

    if (Number(bidMontant) <= currentMax) {
      setMessage("💡 Le bid doit être plus grand que le prix actuel");
      return;
    }

    const newBid = {
      id: bids.length + 1,
      itemId: id,
      bidder: "Vous",
      amount: Number(bidMontant),
    };

    setBids((prev) => [...prev, newBid]);
    setMessage(`✅ Bid de $${bidMontant} placé avec succès`);
    setBidMontant("");
  };

  if (!article) {
    return (
      <p className="text-center mt-10 text-gray-600">Aucun article trouvé.</p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10 border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.nom}</h1>
      <p className="text-gray-600 mb-4">{article.description}</p>

      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-semibold text-green-600">
          Prix de départ : {article.prix} $
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
         
      {/* Liste des bids */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Bids:</h2>
        {bids.length > 0 ? (
          <ul className="space-y-2">
            {bids
              .sort((a, b) => b.amount - a.amount)
              .map((bid) => (
                <li
                  key={bid.id}
                  className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-700">
                    {bid.bidder}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {bid.amount} $
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Aucun bid pour l’instant</p>
        )}
      </div>

      {/* Placer un bid */}
      <form onSubmit={faireUnBid} className="space-y-4">
        <label className="block text-gray-700 font-medium">
          Faire un nouveau bid :
        </label>
        <input
          type="number"
          value={bidMontant}
          onChange={(e) => setBidMontant(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Entrez un montant supérieur"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
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
