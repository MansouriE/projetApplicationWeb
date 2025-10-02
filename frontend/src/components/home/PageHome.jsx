import React from "react";
import Article from "./Article";

function HomePage() {
  const articles = [
    {
      nom: "Chaise",
      description: "Chaise en bois solide",
      prix: 25,
      etat: "Neuf",
    },
    {
      nom: "Table",
      description: "Table ancienne en chêne",
      prix: 120,
      etat: "Usagé",
    },
    {
      nom: "Lampe",
      description: "Lampe LED moderne",
      prix: 15,
      etat: "Comme neuf",
    },
  ];

  return (
    <div>
      <h1>Liste des articles</h1>
      {articles.map((article, index) => (
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
