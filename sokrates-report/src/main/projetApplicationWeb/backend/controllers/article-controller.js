import { supabase } from "../supabaseClient";

async function getArticles() {
  try {
    const { data, error } = await supabase.from("articles").select("*");
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  }
}

async function createArticle() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .insert({
        id_articles: id_articles,
        nom: nom,
        description: description,
        prix: prix,
        etat: etat,
      })
      .single();

    if (error) throw error;
    window.location.reload();
  } catch (error) {
    alert(error.message);
  }
}
