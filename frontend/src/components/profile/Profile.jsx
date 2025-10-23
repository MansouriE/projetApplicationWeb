import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [userArticles, setUserArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articlesAvailable, setArticlesAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndArticles = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("🔍 Début du chargement du profil...");

        // 1. D'abord récupérer le profil utilisateur
        const userResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Vérifier si c'est du JSON
        const userContentType = userResponse.headers.get("content-type");
        if (!userContentType || !userContentType.includes("application/json")) {
          const text = await userResponse.text();
          throw new Error("Erreur serveur: Impossible de charger le profil");
        }

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.error || "Impossible de charger le profil");
        }

        setUser(userData.user || userData);
        console.log("✅ Profil chargé avec succès");

        // 2. Tester si la route des articles existe
        try {
          console.log("🔍 Test de la route des articles...");
          const testResponse = await fetch(
            "https://projetapplicationweb-1.onrender.com/api/users/me/articles",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const testContentType = testResponse.headers.get("content-type");
          
          if (testContentType && testContentType.includes("application/json")) {
            // La route existe et retourne du JSON
            setArticlesAvailable(true);
            
            const articlesData = await testResponse.json();
            if (testResponse.ok) {
              setUserArticles(articlesData.articles || []);
              console.log("✅ Articles chargés:", articlesData.articles?.length || 0);
            }
          } else {
            // La route n'existe pas ou retourne du HTML
            console.log("❌ Route articles non disponible");
            setArticlesAvailable(false);
            setUserArticles([]);
          }
        } catch (articlesError) {
          console.log("❌ Erreur route articles:", articlesError);
          setArticlesAvailable(false);
          setUserArticles([]);
        }

      } catch (err) {
        console.error("❌ Erreur complète:", err);
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

  // Fonction pour récupérer tous les articles et filtrer ceux de l'utilisateur
  const fetchAllUserArticles = async () => {
    try {
      console.log("🔍 Chargement de tous les articles...");
      const response = await fetch("https://projetapplicationweb-1.onrender.com/api/getArticles");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Erreur lors du chargement des articles");
      }

      const allArticles = await response.json();
      
      if (response.ok && user) {
        // Filtrer les articles de l'utilisateur actuel
        const userArticles = allArticles.filter(article => 
          article.user_id === user.id || 
          article.user_id === user.id_utilisateur ||
          // Si pas de user_id, on ne peut pas filtrer
          !article.user_id
        );
        
        setUserArticles(userArticles);
        console.log("✅ Articles utilisateur filtrés:", userArticles.length);
      }
    } catch (error) {
      console.error("❌ Erreur filtrage articles:", error);
    }
  };

  // Le reste du composant reste le même jusqu'à la section Mes Annonces
  // [Garder tout le JSX précédent jusqu'à la section Mes Annonces]

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h3>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
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
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Profil - Garder identique */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {user.prenom?.[0]?.toUpperCase() || user.nom?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
                <p className="text-purple-200">Gérez vos informations personnelles</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Prénom</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{user.prenom}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{user.nom}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{user.courriel}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{user.adresse || "Non renseignée"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Code postal</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">{user.code_postal || "Non renseigné"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier mon profil
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>

        {/* Section Mes Annonces - MODIFIÉE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-900 to-emerald-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Mes Annonces</h2>
                  <p className="text-emerald-200">
                    {userArticles.length} annonce{userArticles.length !== 1 ? 's' : ''} publiée{userArticles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!articlesAvailable && (
                  <button
                    onClick={fetchAllUserArticles}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Charger mes annonces
                  </button>
                )}
                <button
                  onClick={() => navigate("/createArticle")}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle annonce
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!articlesAvailable && userArticles.length === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fonctionnalité en cours de déploiement</h3>
                <p className="text-gray-600 mb-4">La fonctionnalité d'affichage des articles est en cours de déploiement.</p>
                <button
                  onClick={fetchAllUserArticles}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Essayer de charger mes annonces
                </button>
              </div>
            )}

            {userArticles.length === 0 && articlesAvailable && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Aucune annonce</h3>
                <p className="text-gray-600 mb-6">Vous n'avez pas encore publié d'annonces.</p>
                <button
                  onClick={() => navigate("/createArticle")}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Créer ma première annonce
                </button>
              </div>
            )}

            {userArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userArticles.map((article) => (
                  <div key={article.id_articles} className="bg-gray-50 rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-lg">
                    {/* Icône placeholder pour l'article */}
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                      </svg>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">{article.nom}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-semibold text-green-600">{article.prix} $</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.etat === "Neuf"
                            ? "bg-green-100 text-green-800"
                            : article.etat === "Bon"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {article.etat}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/bid/${article.id_articles}`, {
                          state: article
                        })}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;