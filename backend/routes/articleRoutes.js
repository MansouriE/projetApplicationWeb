const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

const jwtSecret = process.env.JWT_SECRET || "cleSuperSecrete!";

router.get("/getArticles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("articles").select("*");

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});


router.post("/createArticle", authMiddleware, async (req, res) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { nom, description, prix, etat, bid, bidPrixDepart, durerBid } =
      req.body;
    const userId = req.user.userId;

    if (!nom || !description || prix == null || !etat) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0) {
      return res.status(400).json({ error: "Prix invalide" });
    }

    const etatsAutorises = ["Neuf", "Disponible", "Bon", "Usagé"];
    if (!etatsAutorises.includes(etat)) {
      return res
        .status(400)
        .json({ error: `État invalide (${etatsAutorises.join(", ")})` });
    }

    let bid_end_date = null;
    let bidPrixDeDepart = null;
    let bid_duration = null;

    if (bid) {
      bidPrixDeDepart = Number(bidPrixDepart);
      bid_duration = durerBid;

      if (!bidPrixDeDepart || bidPrixDeDepart <= 0) {
        return res
          .status(400)
          .json({ error: "Prix de départ du bid invalide" });
      }

      const dureesAutorisees = ["12h", "1d", "2d", "7d", "14d", "30d"];
      if (!dureesAutorisees.includes(bid_duration)) {
        return res
          .status(400)
          .json({ error: `Durée invalide (${dureesAutorisees.join(", ")})` });
      }

      const now = new Date();
      const dureesMap = {
        "12h": 12 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "2d": 2 * 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "14d": 14 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      bid_end_date = new Date(now.getTime() + dureesMap[bid_duration]);
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([
        {
          nom,
          description,
          prix: prixNum,
          etat,
          bid,
          bidPrixDeDepart,
          bid_duration,
          bid_end_date,
          user_id: userId, // Optionnel mais utile
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return res.status(201).json({ message: "Article créé", data });
  } catch (err) {
    console.error("Create article error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/getMesArticles", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (err) {
    console.error("Error fetching user's articles:", err.message);
    res.status(500).json({ error: "Failed to fetch user's articles" });
  }
});

router.get("/getMesArticlesFavori", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: favoriData, error: favoriError } = await supabase
      .from("favori")
      .select("article_id")
      .eq("user_id", userId);

    if (favoriError) throw favoriError;

    const favoriIds = favoriData.map((f) => f.article_id);

    if (favoriIds.length === 0) {
      return res.status(200).json([]);
    }

    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("*")
      .in("id_articles", favoriIds);

    if (articlesError) throw articlesError;

    res.status(200).json(articlesData || []);
  } catch (err) {
    console.error("Error fetching user's favorite articles:", err.message);
    res.status(500).json({ error: "Failed to fetch user's favorite articles" });
  }
});

module.exports = router;