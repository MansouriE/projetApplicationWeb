const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

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