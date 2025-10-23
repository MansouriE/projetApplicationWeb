require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { createClient } = require("@supabase/supabase-js");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUBASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

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
  const { prenom, nom, courriel, password, pseudo, adresse, codePostal } =
    req.body;

  if (
    !prenom ||
    !nom ||
    !courriel ||
    !password ||
    !pseudo ||
    !adresse ||
    !codePostal
  ) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const { data, error } = await supabase
      .from("user")
      .insert({ prenom, nom, courriel, password, pseudo, adresse, codePostal })
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Utilisateur créé", data });
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  // Vérifie le token
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

    // Supprime le mot de passe pour la sécurité
    const { password, ...safeUser } = data;

    res.json({ user: safeUser });
  } catch (err) {
    res.status(403).json({ error: "Token invalide ou expiré" });
  }
});

app.patch("/api/users/me", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded = jwt.verify(token, "cleSuperSecrete!");
    // champs autorisés à la mise à jour
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
    res.status(403).json({ error: "Token invalide ou expiré" });
  }
});
app.get("/api/getArticles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("articles").select("*");

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

app.post("/api/createArticle", async (req, res) => {
  const { nom, description, prix, etat } = req.body;

  if (!nom || !description || prix == null || !etat) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const prixNum = Number(prix);
  if (Number.isNaN(prixNum) || prixNum <= 0) {
    return res.status(400).json({ error: "Prix invalide" });
  }

  // Valider enum si besoin (optionnel)
  const etatsAutorises = ["Neuf", "Disponible", "Bon", "Usagé"];
  if (!etatsAutorises.includes(etat)) {
    return res
      .status(400)
      .json({ error: `État invalide (${etatsAutorises.join(", ")})` });
  }

  try {
    const { data, error } = await supabase
      .from("articles")
      .insert([{ nom, description, prix: prixNum, etat }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: "Article créé", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
