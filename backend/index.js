const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { createClient } = require("@supabase/supabase-js");

const supabaseURL = "https://qwnvawfjlnguyzzwksme.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bnZhd2ZqbG5ndXl6endrc21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIxNzYwNiwiZXhwIjoyMDczNzkzNjA2fQ.rdzQ1VFMdu2NDu00fCLPCL0ziADnSfcaTeXH2NQC4pU";

const supabase = createClient(supabaseURL, supabaseServiceKey);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api/createUser", async (req, res) => {
  const { prenom, nom, courriel, password } = req.body;

  if (!prenom || !nom || !courriel || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const { data, error } = await supabase
      .from("user")
      .insert({ prenom, nom, courriel, password })
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
      "cleSuperSecrete!",
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
    const decoded = jwt.verify(token, "cleSuperSecrete!");
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
