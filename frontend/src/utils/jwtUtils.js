// src/utils/jwtUtils.js

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    // Découpage du token et décodage de la partie payload (2ème partie)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Vérification de l'expiration (exp est en secondes, Date.now() en ms)
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

export const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Retourne l'id selon la convention utilisée (id, userId, ou sub)
    return payload.id || payload.userId || payload.sub || null;
  } catch (e) {
    return null;
  }
};