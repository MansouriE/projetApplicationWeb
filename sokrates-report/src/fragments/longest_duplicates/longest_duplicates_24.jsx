projetApplicationWeb/frontend/src/components/bids/PageBid.jsx [71:78]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Réponse non-JSON: ${raw.slice(0, 120)}`);
      }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/frontend/src/components/bids/PageBid.jsx [114:122]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      });

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Réponse non-JSON: ${raw.slice(0, 120)}`);
      }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



