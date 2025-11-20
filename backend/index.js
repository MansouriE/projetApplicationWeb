require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const supabase = require("./config/supabaseClient");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const bidRoutes = require("./routes/bidRoutes");
const favoriRoutes = require("./routes/favoriRoutes");
const offreRoutes = require("./routes/offreRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["http://localhost:5173", "https://projet-application-web.vercel.app"],
  credentials: true,
}));
// Webhook Stripe AVANT express.json()
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET manquant");
    return res.status(500).send("Webhook non configuré");
  }
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  async function deleteArticleCascade(articleId) {
    try { await supabase.from("bids").delete().eq("article_id", articleId); } catch {}
    try { await supabase.from("offers").delete().eq("article_id", articleId); } catch {}
    try { await supabase.from("favori").delete().eq("article_id", articleId); } catch {}
    const { error } = await supabase.from("articles").delete().eq("id_articles", articleId);
    if (error) throw error;
  }

  try {
    console.log("[Stripe] Webhook reçu");
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paid = (session.payment_status === "paid") || (session.status === "complete");
        let articleId = Number(session.metadata?.article_id);
        if (!Number.isFinite(articleId)) {
          try {
            const { data: orderRow } = await supabase
              .from("orders")
              .select("article_id")
              .eq("session_id", session.id)
              .maybeSingle();
            if (orderRow?.article_id != null) {
              articleId = Number(orderRow.article_id);
            }
          } catch {}
        }
        console.log("[Stripe] checkout.session.completed", { paid, articleId, sessionId: session.id });
        if (paid && Number.isFinite(articleId)) {
          try {
            await supabase
              .from("orders")
              .update({ status: "paid", is_sold: true })
              .eq("session_id", session.id);
          } catch (e) {
            console.warn("Mise à jour order best-effort échouée (schema?)", e?.message);
          }
          const { data: existing, error } = await supabase
            .from("articles")
            .select("id_articles")
            .eq("id_articles", articleId)
            .maybeSingle();
          if (error) throw error;
          if (existing) {
            console.log("[Stripe] Suppression article", articleId);
            await deleteArticleCascade(articleId);
          }
        }
        break;
      }
      default:
        console.log("[Stripe] Event ignoré:", event.type);
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    res.status(500).send("Webhook handler error");
  }
});
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", articleRoutes);
app.use("/api", bidRoutes);
app.use("/api", favoriRoutes);
app.use("/api/offers", offreRoutes);
app.use("/api", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
