const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { verifyToken } = require("../config/jwt");


// 💰 POST /api/bids
router.post("/bids", async (req, res) => {
  try {
    // --- Auth
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token manquant" });

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(403).json({ error: "Token invalide ou expiré" });
    }
    const usrId = decoded.userId;

    // --- Inputs
    const article_id = Number(req.body.article_id);
    const amount = Number(req.body.amount);

    if (!Number.isFinite(article_id) || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Paramètres invalides (article_id, amount)" });
    }

    // --- Récupère l'article
    const { data: article, error: artErr } = await supabase
      .from("articles")
      .select("id_articles, prix, bid, bidPrixDeDepart, bid_end_date")
      .eq("id_articles", article_id)
      .single();

    if (artErr || !article)
      return res.status(404).json({ error: "Article introuvable" });
    if (!article.bid)
      return res.status(400).json({ error: "Les enchères ne sont pas activées pour cet article" });

    if (article.bid_end_date && new Date(article.bid_end_date).getTime() <= Date.now()) {
      return res.status(400).json({ error: "Enchère terminée" });
    }

    const prixDepart = Number(article.bidPrixDeDepart ?? article.prix) || 0;

    // --- Max actuel
    const { data: topBid, error: topErr } = await supabase
      .from("bids")
      .select("amount")
      .eq("article_id", article_id)
      .order("amount", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (topErr) {
      console.error("Top bid error:", topErr);
      return res.status(500).json({ error: "Erreur vérification du prix courant" });
    }

    const currentMax = Math.max(prixDepart, Number(topBid?.amount ?? 0));
    if (amount <= currentMax) {
      return res.status(400).json({ error: `Le bid doit être > ${currentMax}` });
    }

    // --- Insertion du bid
    const { data: inserted, error: insErr } = await supabase
      .from("bids")
      .insert([{ article_id, usr_id: usrId, amount }])
      .select("id, article_id, usr_id, amount, created_at")
      .single();

    if (insErr) throw insErr;

    return res.status(201).json({ message: "Bid créé", bid: inserted });
  } catch (e) {
    console.error("POST /api/bids error:", e);
    return res.status(500).json({ error: "Erreur interne" });
  }
});

router.get("/bids", async (req, res) => {
  const articleId = Number(req.query.article_id);
  if (!Number.isFinite(articleId)) {
    return res.status(400).json({ error: "Paramètre 'article_id' invalide" });
  }

  
  try {
    const { data, error } = await supabase
      .from("bids")
      .select("id, article_id, usr_id, amount, created_at")
      .eq("article_id", articleId)
      .order("amount", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (e) {
    console.error("GET /api/bids error:", e);
    return res.status(500).json({ error: "Erreur lors du chargement des bids" });
  }
});

module.exports = router;
