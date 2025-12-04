projetApplicationWeb/backend/routes/offreRoutes.js [64:72]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (error)
      return res.status(500).json({ error: "Erreur lors de la récupération" });

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/backend/routes/offreRoutes.js [83:91]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (error)
      return res.status(500).json({ error: "Erreur lors de la récupération" });

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



