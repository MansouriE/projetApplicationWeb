projetApplicationWeb/backend/controllers/article-controller.js [3:10]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function getArticles() {
  try {
    const { data, error } = await supabase.from("articles").select("*");
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  }
}
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



projetApplicationWeb/backend/controllers/users-controller.js [3:10]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function getUers() {
  try {
    const { data, error } = await supabase.from("user").select("*");
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  }
}
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



