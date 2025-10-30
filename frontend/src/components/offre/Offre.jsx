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
        // Offres reçues (sur vos articles)
        const receivedRes = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/offers/received",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Offres envoyées (par vous)
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

  if (!isLoggedIn) return <p>Veuillez vous connecter pour voir vos offres.</p>;
  if (loading) return <p>Chargement des offres...</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Offres reçues */}
      <div>
        <h2 className="text-xl font-bold mb-4">Offres sur vos articles</h2>
        {receivedOffers.length === 0 ? (
          <p>Aucune offre sur vos articles.</p>
        ) : (
          <ul className="space-y-3">
            {receivedOffers.map((offer) => (
              <li
                key={offer.article_id + "-" + offer.sender_id}
                className="border p-4 rounded-lg bg-gray-50 hover:shadow-md transition"
              >
                <p>
                  L'utilisateur ID <strong>{offer.sender_id}</strong> a proposé{" "}
                  <span className="text-green-600 font-semibold">{offer.amount} $</span> sur l'article{" "}
                  <strong>{offer.article_id}</strong>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Offres envoyées */}
      <div>
        <h2 className="text-xl font-bold mb-4">Offres que vous avez faites</h2>
        {sentOffers.length === 0 ? (
          <p>Vous n'avez fait aucune offre pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {sentOffers.map((offer) => (
              <li
                key={offer.article_id + "-" + offer.owner_id}
                className="border p-4 rounded-lg bg-gray-50 hover:shadow-md transition"
              >
                <p>
                  Vous avez proposé{" "}
                  <span className="text-green-600 font-semibold">{offer.amount} $</span> sur l'article{" "}
                  <strong>{offer.article_id}</strong> (propriétaire ID : {offer.owner_id})
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
