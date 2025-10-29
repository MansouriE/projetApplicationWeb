const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

router.post("/favori", authMiddleware, async (req, res) => {
  const { articleId, favorite } = req.body;
  const userId = req.user.userId;

  try {
    if (favorite) {
      await supabase.from("favori").insert({ user_id: userId, article_id: articleId });
    } else {
      await supabase
        .from("favori")
        .delete()
        .eq("user_id", userId)
        .eq("article_id", articleId);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error });
  }
});

router.get("/favori/status", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const articleId = req.query.articleId;

  try {
    const { data, error } = await supabase
      .from("favori")
      .select("*")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .single();

    res.json({ isFavori: !!data });
  } catch (err) {
    console.error(err);
    res.json({ isFavori: false });
  }
});

module.exports = router;