import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Offres() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchOffers = async () => {
      try {
        const receivedRes = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/offers/received",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sentRes = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/offers/sent",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const receivedData = await receivedRes.json();
        const sentData = await sentRes.json();

        setReceivedOffers(receivedData);
        setSentOffers(sentData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [isLoggedIn, token]);

  const handleAccept = async (offerId) => {
    try {
      console.log("Offre acceptée:", offerId);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (offerId) => {
    try {
      const res = await fetch(
        `https://projetapplicationweb-1.onrender.com/api/offers/${offerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la suppression");

      setReceivedOffers(receivedOffers.filter(o => o.id !== offerId));
      alert("Offre supprimée !");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) return <p className="text-center mt-6">Veuillez vous connecter pour voir vos offres.</p>;
  if (loading) return <p className="text-center mt-6">Chargement des offres...</p>;

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-2xl p-6 space-y-8 bg-gray-100 rounded-xl shadow-md">
        {/* Offres reçues */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Offres sur vos articles</h2>
          {receivedOffers.length === 0 ? (
            <p className="text-center text-gray-600">Aucune offre sur vos articles.</p>
          ) : (
            <ul className="space-y-3">
              {receivedOffers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex flex-col md:flex-row justify-between items-center border p-3 rounded-lg bg-white shadow hover:shadow-lg transition w-full"
                >
                  <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-0">
                    L'utilisateur <strong>{offer.sender_id}</strong> a proposé{" "}
                    <span className="text-green-600 font-semibold">{offer.amount} $</span> pour l'article{" "}
                    <strong>{offer.article_id}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(offer.id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleDecline(offer.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    >
                      Refuser
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Offres envoyées */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Offres que vous avez faites</h2>
          {sentOffers.length === 0 ? (
            <p className="text-center text-gray-600">Vous n'avez fait aucune offre pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {sentOffers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex flex-col md:flex-row justify-between items-center border p-3 rounded-lg bg-white shadow hover:shadow-md transition w-full"
                >
                  <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-0">
                    Vous avez proposé{" "}
                    <span className="text-green-600 font-semibold">{offer.amount} $</span> pour l'article{" "}
                    <strong>{offer.article_id}</strong> (propriétaire ID : {offer.owner_id})
                  </p>
                  <button
                    onClick={() => handleDecline(offer.id)}
                    className="px-3 py-1 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition"
                  >
                    Annuler
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
