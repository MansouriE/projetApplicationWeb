require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { createClient } = require("@supabase/supabase-js");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUBASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET || "cleSuperSecrete!";

const supabase = createClient(supabaseURL, supabaseServiceKey);

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://projet-application-web.vercel.app",
  ],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api/createUser", async (req, res) => {
  const { prenom, nom, courriel, password, pseudo, adresse, code_postal } =
    req.body;

  if (
    !prenom ||
    !nom ||
    !courriel ||
    !password ||
    !pseudo ||
    !adresse ||
    !code_postal
  ) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const { data, error } = await supabase
      .from("user")
      .insert({ prenom, nom, courriel, password, pseudo, adresse, code_postal })
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Utilisateur créé", data });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("courriel", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: data.id, email: data.courriel },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Connexion réussie", token, user: data });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const { password, ...safeUser } = data;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(403).json({ error: "Token invalide ou expiré" });
  }
});

app.patch("/api/users/me", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const { prenom, nom, adresse, code_postal, courriel } = req.body;
    const update = {};

    if (prenom !== undefined) update.prenom = prenom;
    if (nom !== undefined) update.nom = nom;
    if (adresse !== undefined) update.adresse = adresse;
    if (code_postal !== undefined) update.code_postal = code_postal;
    if (courriel !== undefined) update.courriel = courriel;

    const { data, error } = await supabase
      .from("user")
      .update(update)
      .eq("id", decoded.userId)
      .select("*")
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { password, ...safeUser } = data;
    res.json({ user: safeUser });
  } catch (e) {
    console.error("Update user error:", e);
    res.status(403).json({ error: "Token invalide ou expiré" });
  }
});

// Route pour récupérer les articles d'un utilisateur
/*
app.get("/api/users/me/articles", async (req, res) => {
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

app.get("/api/getArticles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("articles").select("*");

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

app.post("/api/createArticle", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { nom, description, prix, etat, bid, bidPrixDepart, durerBid } =
      req.body;

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
          user_id: decoded.userId, // Optionnel mais utile
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
