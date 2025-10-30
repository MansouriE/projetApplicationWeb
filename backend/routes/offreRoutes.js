const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

router.post("/offer", authMiddleware, async (req, res) => {
  try {
    const sender_id = req.user.id;
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
      .eq("id", article_id)
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

module.exports = router;
