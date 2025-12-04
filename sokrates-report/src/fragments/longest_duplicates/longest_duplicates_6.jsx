projetApplicationWeb/frontend/src/components/profile/Profile.jsx [23:37]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/frontend/src/components/settings/Settings.jsx [23:39]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



