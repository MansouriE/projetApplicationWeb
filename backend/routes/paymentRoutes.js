const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../middleware/check-auth");

// POST /api/payments/create-checkout-session
router.post("/payments/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { articleId, quantity = 1 } = req.body || {};
    const buyerId = req.user?.userId;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe n'est pas configuré (clé manquante)" });
    }

    if (!articleId || !Number.isFinite(Number(articleId))) {
      return res.status(400).json({ error: "Paramètre 'articleId' invalide" });
    }

    // Récupérer l'article pour tarifer et valider
    const { data: article, error } = await supabase
      .from("articles")
      .select("id_articles, nom, description, prix, user_id")
      .eq("id_articles", Number(articleId))
      .maybeSingle();

    if (error) throw error;
    if (!article) return res.status(404).json({ error: "Article introuvable" });

    if (String(article.user_id) === String(buyerId)) {
      return res.status(403).json({ error: "Vous ne pouvez pas acheter votre propre article" });
    }

    const qty = Math.max(1, Number(quantity || 1));
    const unitAmount = Math.round(Number(article.prix) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: "Prix d'article invalide" });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: process.env.STRIPE_CURRENCY || "eur",
            unit_amount: unitAmount,
            product_data: {
              name: article.nom,
              description: article.description || undefined,
            },
          },
        },
      ],
      metadata: {
        article_id: String(article.id_articles),
        buyer_id: String(buyerId || ""),
      },
      success_url: `${FRONTEND_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/?payment=cancel`,
    });

    // Enregistrer la commande (best effort selon schéma actuel)
    try {
      await supabase.from("orders").insert([
        {
          session_id: session.id,
          article_id: article.id_articles,
          buyer_id: buyerId,
          amount: unitAmount / 100,
          currency: process.env.STRIPE_CURRENCY || "eur",
          status: "created",
          is_sold: false,
        },
      ]);
    } catch (e) {
      console.warn("Insertion order échouée (best-effort)", e?.message);
    }

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout session error:", e);
    return res.status(500).json({ error: e.message || "Erreur Stripe" });
  }
});

// Suppression des dépendances puis de l'article
async function deleteArticleCascade(articleId) {
  try { await supabase.from("bids").delete().eq("article_id", articleId); } catch {}
  try { await supabase.from("offers").delete().eq("article_id", articleId); } catch {}
  try { await supabase.from("favori").delete().eq("article_id", articleId); } catch {}
  const { error } = await supabase.from("articles").delete().eq("id_articles", articleId);
  if (error) throw error;
}

// GET /api/payments/confirm?session_id=...
router.get("/payments/confirm", authMiddleware, async (req, res) => {
  try {
    const { session_id: sessionId } = req.query || {};
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe n'est pas configuré (clé manquante)" });
    }
    if (!sessionId) return res.status(400).json({ error: "session_id manquant" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ error: "Session introuvable" });

    const paid = session.payment_status === "paid" || session.status === "complete";
    let articleId = Number(session.metadata?.article_id);
    if (!Number.isFinite(articleId)) {
      const { data: orderRow } = await supabase
        .from("orders")
        .select("article_id")
        .eq("session_id", session.id)
        .maybeSingle();
      if (orderRow?.article_id != null) {
        articleId = Number(orderRow.article_id);
      }
    }
    if (!paid || !Number.isFinite(articleId)) {
      return res.status(400).json({ error: "Paiement non confirmé ou article invalide" });
    }

    const { data: existing, error } = await supabase
      .from("articles")
      .select("id_articles")
      .eq("id_articles", articleId)
      .maybeSingle();
    if (error) throw error;

    try {
      await supabase.from("orders").update({ status: "paid", is_sold: true }).eq("session_id", session.id);
    } catch {}

    if (existing) {
      await deleteArticleCascade(articleId);
    }

    return res.json({ success: true });
  } catch (e) {
    console.error("Payment confirm error:", e);
    return res.status(500).json({ error: e.message || "Erreur de confirmation" });
  }
});

module.exports = router;

