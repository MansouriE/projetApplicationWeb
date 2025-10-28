const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { signToken } = require("../config/jwt");

app.post("/createUser", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

module.exports = router;
