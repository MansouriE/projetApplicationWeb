export async function fetchCurrentUser(token) {
  const res = await fetch(
    "https://projetapplicationweb-1.onrender.com/api/users/me",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Impossible de charger le profil");
  }

  return data.user || data;
}
