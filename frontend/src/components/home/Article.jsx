import React from "react";
import { useNavigate } from "react-router-dom";

function Article({ id, nom, description, prix, etat }) {
  const navigate = useNavigate();

  const bidClic = () => {
    navigate(`/bid/${id}`, {
      state: { id, nom, description, prix, etat },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 m-4 w-80 transition-all duration-300 hover:scale-105 hover:shadow-xl">
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
        onClick={bidClic}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Bids
      </button>
    </div>
  );
}

export default Article;
