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

module.exports = router;
