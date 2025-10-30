const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

router.post("/offer", authMiddleware, async (req, res) => {
  try {
    const sender_id = req.user.userId;
    const { article_id, amount } = req.body;

    if (!article_id || amount === undefined) {
      return res.status(400).json({ error: "Missing article_id or amount" });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const { data: article, error } = await supabase
      .from("articles")
      .select("user_id, prix, offre_reduction")
      .eq("id_articles", article_id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Article not found" });
    }

    const { user_id, prix, offre_reduction } = article;
    const minOffer = prix - (offre_reduction / 100) * prix;

    if (parsedAmount < minOffer) {
      return res
        .status(400)
        .json({ error: `Offer must be at least ${minOffer}` });
    }

    await supabase
      .from("offers")
      .insert([
        {
          owner_id: user_id,
          sender_id,
          article_id,
          amount: parsedAmount,
        },
      ]);

    res.status(201).json({ success: true, message: "Offer submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/received", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: offers, error } = await supabase
      .from("offers")
      .select("*")
      .eq("owner_id", userId);

    if (error) return res.status(500).json({ error: "Erreur lors de la récupération" });

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/sent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: offers, error } = await supabase
      .from("offers")
      .select("*")
      .eq("sender_id", userId);

    if (error) return res.status(500).json({ error: "Erreur lors de la récupération" });

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const offerId = req.params.id;

    const { data: offer, error, status } = await supabase
      .from("offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (error && status !== 406) {
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!offer) {
      return res.status(404).json({ error: "Offre introuvable" });
    }

    if (offer.sender_id !== userId && offer.owner_id !== userId) {
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos offres ou celles reçues sur vos articles" });
    }

    const { error: deleteError } = await supabase
      .from("offers")
      .delete()
      .eq("id", offerId);

    if (deleteError) {
      return res.status(500).json({ error: "Erreur lors de la suppression de l'offre" });
    }

    res.json({ success: true, message: "Offre supprimée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
