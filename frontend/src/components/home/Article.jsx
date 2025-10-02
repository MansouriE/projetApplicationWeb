import React from "react";
import "./Article.css";

function Article({ nom, description, prix, etat }) {
  return (
    <div className="article-card">
      <h2>{nom}</h2>
      <p>{description}</p>
      <p>
        <strong>Prix :</strong> {prix} €
      </p>
      <p>
        <strong>État :</strong> {etat}
      </p>
    </div>
  );
}

export default Article;
