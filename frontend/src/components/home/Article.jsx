import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Article(props) {
  
  const { id, nom, description, prix, etat, bid } = props;

  const navigate = useNavigate();
  const { token, isLoggedIn } = useContext(AuthContext);
  const [isFavori, setIsFavori] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFavoriteStatus = async () => {
      try {
        const res = await fetch(`https://projetapplicationweb-1.onrender.com/api/favori/status?articleId=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setIsFavori(data.isFavori);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFavoriteStatus();
  }, [id, isLoggedIn]);

  const bidClic = () => {
    navigate(`/bid/${id}`, { state: { ...props } });
  };

const toggleFavori = async () => {
  if (!isLoggedIn || loadingFav) return;
  setLoadingFav(true);

  const newState = !isFavori;
  setIsFavori(newState);

  try {
    const res = await fetch("https://projetapplicationweb-1.onrender.com/api/favori", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId: id, favorite: newState }),
    });
    const data = await res.json();
    if (!data.success) setIsFavori(!newState);
  } catch (err) {
    setIsFavori(!newState);
    console.error(err);
  } finally {
    setLoadingFav(false);
  }
};

  return (
    <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4 w-80 transition-all duration-300 hover:scale-105 hover:shadow-xl">

      {isLoggedIn && (
        <button
          onClick={toggleFavori}
          className="absolute -top-0 right-0 p-1 transition-transform duration-200 hover:scale-110 z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavori ? "red" : "none"}
            stroke={isFavori ? "red" : "gray"}
            strokeWidth="2"
            className="w-6 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5
                2.09C13.09 3.81 14.76 3 16.5
                3 19.58 3 22 5.42 22 8.5c0
                3.78-3.4 6.86-8.55 11.54L12
                21.35z"
            />
          </svg>
        </button>
      )}

      <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-3 truncate">{nom}</h2>
      <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>

      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-semibold text-green-600">{prix} $</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            etat === "Neuf"
              ? "bg-green-100 text-green-800"
              : etat === "Bon état"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {etat}
        </span>
      </div>

      {isLoggedIn && (
        <>
          {bid && (
            <button
              onClick={bidClic}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-2"
            >
              Bids
            </button>
          )}

          <button
            onClick={() => {}}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Acheter
          </button>
        </>
      )}
    </div>
  );
}

export default Article;
