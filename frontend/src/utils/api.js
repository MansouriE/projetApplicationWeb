import { fetchWithAuth } from "./fetchWithAuth";

export async function fetchCurrentUser(token) {
  const data = await fetchWithAuth(
    "https://projetapplicationweb-1.onrender.com/api/users/me",
    {},
    token
  );

  if (!data || data.error) {
    throw new Error(data.error || "Impossible de charger le profil");
  }

  return data.user || data;
}
