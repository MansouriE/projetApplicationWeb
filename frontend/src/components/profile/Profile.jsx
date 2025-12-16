import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Article from "../home/Article.jsx"; // Adjust path if needed
import AccessGuard from "../acessGuard/AccessGuard.jsx";
import { fetchCurrentUser } from "../../utils/api.js";
import { fetchWithAuth } from "../../utils/fetchWithAuth.js";

function Profile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [allArticlesFavoris, setAllArticlesFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchFavoris = async () => {
    const data = await fetchWithAuth(
      "https://projetapplicationweb-1.onrender.com/api/getMesArticlesFavori",
      {},
      token
    );
    setAllArticlesFavoris(data || []);
  };

  const fetchArticles = async () => {
    const data = await fetchWithAuth(
      "https://projetapplicationweb-1.onrender.com/api/getMesArticles",
      {},
      token
    );
    setAllArticles(data || []);
  };

  // Fetch profile and articles
  useEffect(() => {
    const fetchProfileAndArticles = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch user profile
        const userData = await fetchCurrentUser(token);
        setUser(userData);

        // Fetch all articles
        await fetchArticles();

        // Fetch favorite articles
        await fetchFavoris();
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && token) {
      fetchProfileAndArticles();
    } else {
      setLoading(false);
    }
  }, [token, isLoggedIn]);

  // Reload articles manually
  const reloadArticles = async () => {
    try {
      await fetchArticles();
      await fetchFavoris();
    } catch (err) {
      console.error("Erreur rechargement:", err);
    }
  };
  // --- Handlers pour Modifier / Supprimer ---
  const handleEdit = (article) => {
    // à toi de créer la page d’édition si besoin
    navigate(`/articles/${article.id_articles}/edit`, { state: article });
  };

  const handleDelete = async (idArticles) => {
    if (!confirm("Supprimer cet article ?")) return;

    try {
      const data = await fetchWithAuth(
        `https://projetapplicationweb-1.onrender.com/api/articles/${idArticles}`,
        { method: "DELETE" },
        token
      );

      // If fetchWithAuth returns an error inside the JSON
      if (data.error) throw new Error(data.error || "Suppression échouée");

      await reloadArticles();
    } catch (e) {
      alert(e.message);
    }
  };

  const renderArticles = (articles) =>
    articles.length === 0 ? (
      <p className="text-gray-500 col-span-full text-center">
        Aucun article disponible.
      </p>
    ) : (
      articles.map((article) => {
        const articleProps = {
          ...article,
          id: article.id_articles,
          isProfilePage: true,
          onEdit: () => handleEdit(article),
          onDelete: () => handleDelete(article.id_articles),
        };
        return <Article key={article.id_articles} {...articleProps} />;
      })
    );

  if (!user) return null;

  return (
    <AccessGuard loading={loading} isLoggedIn={isLoggedIn} error={error}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-800 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {user.prenom?.[0]?.toUpperCase() ||
                      user.nom?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Profile</h1>
                  <p className="text-white/80">
                    {user.prenom} {user.nom}
                  </p>
                  <button
                    onClick={reloadArticles}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors duration-200"
                  >
                    Recharger mes articles
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Mes Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderArticles(allArticles)}
            </div>
          </div>

          {/* Favorite Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Mes Favoris
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderArticles(allArticlesFavoris)}
            </div>
          </div>
        </div>
      </div>
    </AccessGuard>
  );
}

export default Profile;
