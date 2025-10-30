import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Article from "../home/Article.jsx"; // Adjust path if needed

function Profile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [allArticlesFavoris, setAllArticlesFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch profile and articles
  useEffect(() => {
    const fetchProfileAndArticles = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch user profile
        const userResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = await userResponse.json();
        if (!userResponse.ok) {
          throw new Error(userData.error || "Impossible de charger le profil");
        }
        setUser(userData.user || userData);

        // Fetch all articles
        const articlesResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/getMesArticles",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const articlesData = await articlesResponse.json();

        if (articlesResponse.ok) {
          setAllArticles(articlesData || []);
        } else {
          setAllArticles([]);
        }
        // Fetch favorite articles
        const favorisResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/getMesArticlesFavori",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const favorisData = await favorisResponse.json();

        if (favorisResponse.ok) {
          setAllArticlesFavoris(favorisData || []);
        } else {
          setAllArticlesFavoris([]);
        }
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
      const articlesResponse = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/getMesArticles",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const articlesData = await articlesResponse.json();
      if (articlesResponse.ok) {
        setAllArticles(articlesData || []);
      }

      const favorisResponse = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/getMesArticlesFavori",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const favorisData = await favorisResponse.json();
      if (favorisResponse.ok) {
        setAllArticlesFavoris(favorisData || []);
      } else {
        setAllArticlesFavoris([]);
      }
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
      const res = await fetch(
        `https://projetapplicationweb-1.onrender.com/api/articles/${idArticles}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Suppression échouée");
      await reloadArticles();
    } catch (e) {
      alert(e.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
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
            {allArticles.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">
                Aucun article disponible.
              </p>
            ) : (
              allArticles.map((article) => (
                <Article
                  id={article.id_articles}
                  nom={article.nom}
                  description={article.description}
                  prix={article.prix}
                  etat={article.etat}
                  bid={article.bid}
                  bidPrixDeDepart={article.bidPrixDeDepart}
                  bid_duration={article.bid_duration}
                  bid_end_date={article.bid_end_date}
                  offre={article.offre}
                  offre_reduction={article.offre_reduction}
                  isProfilePage={true}
                  onEdit={() => handleEdit(article)}
                  onDelete={() => handleDelete(article.id_articles)}
                  image_url={article.image_url}
                />
              ))
            )}
          </div>
        </div>

        {/* Favorite Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Favoris</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allArticlesFavoris.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">
                Aucun favori.
              </p>
            ) : (
              allArticlesFavoris.map((article) => (
                <Article
                  key={article.id_articles}
                  id={article.id_articles}
                  nom={article.nom}
                  description={article.description}
                  prix={article.prix}
                  etat={article.etat}
                  bid={article.bid}
                  bidPrixDeDepart={article.bidPrixDeDepart}
                  bid_duration={article.bid_duration}
                  bid_end_date={article.bid_end_date}
                  offre={article.offre}
                  offre_reduction={article.offre_reduction}
                  isProfilePage={false}
                  onEdit={() => handleEdit(article)}
                  onDelete={() => handleDelete(article.id_articles)}
                  image_url={article.image_url}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
