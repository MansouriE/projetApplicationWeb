import React from "react";
import GuardCard from "./GuardCard";
import GuardIcon from "./GuardIcon";

export default function AccessGuard({ loading, isLoggedIn, error, children }) {
  if (error) {
    return (
      <GuardCard
        icon={<GuardIcon type="error" />}
        title="Erreur"
        message={error}
      >
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Réessayer
        </button>
      </GuardCard>
    );
  }

  if (!isLoggedIn) {
    return (
      <GuardCard
        icon={<GuardIcon type="error" />}
        title="Accès non autorisé"
        message="Vous devez être connecté pour accéder à cette page."
      />
    );
  }

  if (loading) {
    return (
      <GuardCard>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement…</p>
      </GuardCard>
    );
  }

  return children;
}
