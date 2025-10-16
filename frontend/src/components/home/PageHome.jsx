import React, { useEffect, useState, useContext } from "react";
import Article from "./Article";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/getArticles"
        );
        if (!response.ok)
          throw new Error("Erreur lors du chargement des articles");

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Nos Articles
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Découvrez notre sélection exclusive d'articles soigneusement choisis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-slate-800">
              {articles.length} articles disponibles
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Trouvez ce qui vous correspond
            </p>
          </div>
          {isLoggedIn && (
            <Link to="/createArticle" className="w-full sm:w-auto">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Ajouter un article
              </button>
            </Link>
          )}
        </div>
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && articles.length === 0 && (
          <p>Aucun article trouvé.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {!loading &&
            !error &&
            articles.map((article, index) => (
              <div key={index} className="flex justify-center">
                <Article
                  nom={article.nom}
                  description={article.description}
                  prix={article.prix}
                  etat={article.etat}
                />
              </div>
            ))}
        </div>
        {articles.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-purple-500"
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
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Aucun article disponible
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Soyez le premier à partager un article avec la communauté
              </p>
              <Link to="/createArticle">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200">
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
