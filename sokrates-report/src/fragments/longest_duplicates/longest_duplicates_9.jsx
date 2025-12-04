projetApplicationWeb/frontend/src/components/profile/Profile.jsx [40:52]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        const articlesResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/getMesArticles",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const articlesData = await articlesResponse.json();

        if (articlesResponse.ok) {
          setAllArticles(articlesData || []);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/frontend/src/components/profile/Profile.jsx [91:102]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      const articlesResponse = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/getMesArticles",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const articlesData = await articlesResponse.json();
      if (articlesResponse.ok) {
        setAllArticles(articlesData || []);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



