const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const jwtSecret = process.env.JWT_SECRET || "cleSuperSecrete!";

router.get("/getArticles", async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase.from("articles").select("*");

    if (search && search.trim() !== "") {
      query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.post(
  "/createArticle",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        nom,
        description,
        prix,
        etat,
        bid,
        bidPrixDepart,
        durerBid,
        offre,
        offreReduction,
      } = req.body;

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

      const bidBool = bid === true || bid === "true";
      const offreBool = offre === true || offre === "true";

      if (bidBool && offreBool) {
        return res.status(400).json({
          error: "Un article ne peut pas accepter à la fois bids et offres.",
        });
      }

      let bid_end_date = null;
      let bidPrixDeDepartNum = null;
      let bid_duration = null;

      if (bidBool) {
        bidPrixDeDepartNum = Number(bidPrixDepart);
        bid_duration = durerBid;

        if (!bidPrixDeDepartNum || bidPrixDeDepartNum <= 0) {
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

      let offre_reduction_value = null;
      if (offreBool) {
        const reductionsAutorisees = ["2.5", "5", "10", "15", "20", "25"];
        if (!reductionsAutorisees.includes(String(offreReduction))) {
          return res.status(400).json({
            error: `Réduction invalide (${reductionsAutorisees.join(", ")})`,
          });
        }
        offre_reduction_value = Number(offreReduction);
      }

      // Gestion image si présente
      let imageUrl = null;
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("articles-images")
          .upload(fileName, req.file.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: req.file.mimetype,
          });

        if (uploadError) {
          console.error("Upload image error:", uploadError);
          return res
            .status(500)
            .json({ error: "Erreur lors de l'upload de l'image" });
        }

        const { data: publicData } = supabase.storage
          .from("articles-images")
          .getPublicUrl(fileName);

        imageUrl = publicData?.publicUrl || null;

        if (!imageUrl) {
          console.warn("Impossible de récupérer l'URL publique de l'image");
        }
      }

      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            nom,
            description,
            prix: prixNum,
            etat,
            bid: bidBool,
            offre: offreBool,
            offre_reduction: offreBool ? offre_reduction_value : null,
            bidPrixDeDepart: bidBool ? bidPrixDeDepartNum : null,
            bid_duration: bidBool ? bid_duration : null,
            bid_end_date: bidBool ? bid_end_date : null,
            user_id: userId,
            image_url: imageUrl,
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
  }
);

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

// DELETE /api/articles/:id
router.delete("/articles/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Id invalide" });

  const userId = req.user.userId;

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id_articles", id)
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

router.get("/articles/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Paramètre 'id' invalide" });
  }

  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id_articles, user_id, nom, description, prix, etat, bid, bidPrixDeDepart, bid_duration, bid_end_date"
      )
      .eq("id_articles", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Article introuvable" });

    return res.status(200).json(data);
  } catch (e) {
    console.error("GET /api/articles/:id error:", e);
    return res.status(500).json({ error: "Erreur interne" });
  }
});

router.put("/articles/:id", authMiddleware, async (req, res) => {
  const { userId } = req.user; // injecté par ton middleware JWT
  const id = Number(req.params.id);
  const { nom, description, prix, etat } = req.body;

  // Validation simple
  if (!nom || !description || prix == null || !etat)
    return res
      .status(400)
      .json({ error: "Champs manquants (nom, description, prix, etat)" });

  const prixNum = Number(prix);
  if (!Number.isFinite(prixNum) || prixNum <= 0)
    return res.status(400).json({ error: "Prix invalide" });

  const etatsAutorises = ["Neuf", "Disponible", "Bon", "Usagé"];
  if (!etatsAutorises.includes(etat))
    return res
      .status(400)
      .json({ error: `État invalide (${etatsAutorises.join(", ")})` });

  // Vérifie que l’article appartient au user
  const { data: article, error: artErr } = await supabase
    .from("articles")
    .select("id_articles, user_id")
    .eq("id_articles", id)
    .maybeSingle();

  if (artErr) return res.status(400).json({ error: artErr.message });
  if (!article) return res.status(404).json({ error: "Article introuvable" });
  if (String(article.user_id) !== String(userId))
    return res
      .status(403)
      .json({ error: "Accès refusé (pas propriétaire de l'article)" });

  // Met à jour l’article
  const { data: updated, error: updErr } = await supabase
    .from("articles")
    .update({
      nom: nom.trim(),
      description: description.trim(),
      prix: prixNum,
      etat,
    })
    .eq("id_articles", id)
    .select("*")
    .single();

  if (updErr) return res.status(400).json({ error: updErr.message });
  res.json({ message: "Article mis à jour", article: updated });
});

module.exports = router;
