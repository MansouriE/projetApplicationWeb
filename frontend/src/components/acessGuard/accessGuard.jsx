import React from "react";
import GuardCard from "./GuardCard";

export default function AccessGuard({ loading, isLoggedIn, error, children }) {
  if (error) {
    return (
      <GuardCard
        icon={
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
        }
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
        icon={
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
        }
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
