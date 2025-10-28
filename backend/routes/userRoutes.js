const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

router.get("/me", authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const { data, error } = await supabase.from("user").select("*").eq("id", userId).single();
  if (error || !data) return res.status(404).json({ error: "Utilisateur introuvable" });
  const { password, ...safeUser } = data;
  res.json({ user: safeUser });
});

router.patch("/me", authMiddleware, async (req, res) => {
  const { userId } = req.user;
  const update = req.body;

  const { data, error } = await supabase
    .from("user")
    .update(update)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) return res.status(400).json({ error: error.message });
  const { password, ...safeUser } = data;
  res.json({ user: safeUser });
});

// Route pour récupérer les articles d'un utilisateur
/*
router.get("/me/articles", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    res.json({ articles: data || [] });
  } catch (err) {
    console.error("Get user articles error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des articles" });
  }
});
*/

module.exports = router;
