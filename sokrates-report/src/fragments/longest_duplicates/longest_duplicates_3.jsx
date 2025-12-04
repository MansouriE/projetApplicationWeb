projetApplicationWeb/frontend/src/components/profile/Profile.jsx [57:73]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        const favorisResponse = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/getMesArticlesFavori",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const favorisData = await favorisResponse.json();

        if (favorisResponse.ok) {
          setAllArticlesFavoris(favorisData || []);
        } else {
          setAllArticlesFavoris([]);
        }
      } catch (err) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/frontend/src/components/profile/Profile.jsx [105:120]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      const favorisResponse = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/getMesArticlesFavori",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const favorisData = await favorisResponse.json();
      if (favorisResponse.ok) {
        setAllArticlesFavoris(favorisData || []);
      } else {
        setAllArticlesFavoris([]);
      }
    } catch (err) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



