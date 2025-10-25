import React from "react";
import { useNavigate } from "react-router-dom";

function Article({ id, nom, description, prix, etat, bid }) {
  const navigate = useNavigate();

  const bidClic = () => {
    navigate(`/bid/${id}`, {
      state: { ...props }, // <-- Envoie toutes les infos au frontend
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4 w-80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
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

      <button
        onClick={() => {}}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-2"
      >
        Acheter
      </button>

      {bid && (
        <button
          onClick={bidClic}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Bids
        </button>
      )}

      <button
        onClick={() => {}}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-2"
      >
        Favori
      </button>
    </div>
  );
}

export default Article;
