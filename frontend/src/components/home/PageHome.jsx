import React, { useEffect, useState } from "react";
import Article from "./Article";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, logout } = useContext(AuthContext);

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
    <div>
      <h1>Liste des articles</h1>
      {isLoggedIn && (
        <div className="toolbar">
          <Link to="/createArticle">
            <button>Ajouter un article</button>
          </Link>
        </div>
      )}

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <p>Aucun article trouvé.</p>
      )}

      {!loading &&
        !error &&
        articles.map((article, index) => (
          <Article
            key={index}
            nom={article.nom}
            description={article.description}
            prix={article.prix}
            etat={article.etat}
          />
        ))}
    </div>
  );
}

export default HomePage;
