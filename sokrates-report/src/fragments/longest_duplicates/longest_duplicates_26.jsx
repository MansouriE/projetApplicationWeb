projetApplicationWeb/frontend/src/components/profile/Profile.jsx [48:55]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        );
        const articlesData = await articlesResponse.json();

        if (articlesResponse.ok) {
          setAllArticles(articlesData || []);
        } else {
          setAllArticles([]);
        }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/frontend/src/components/settings/Settings.jsx [43:51]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        );

        const articlesData = await articlesResponse.json();
        
        if (articlesResponse.ok) {
          setAllArticles(articlesData || []);
        } else {
          setAllArticles([]);
        }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



