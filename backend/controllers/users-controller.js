import { supabase } from "../supabaseClient";

async function getUers() {
  try {
    const { data, error } = await supabase.from("user").select("*");
    if (error) throw error;
  } catch (error) {
    alert(error.message);
  }
}

async function createUser() {
  try {
    const { data, error } = await supabase
      .from("user")
      .insert({
        id: id,
        pseudo: pseudo,
        courriel: courriel,
        password: password,
        adresse: adresse,
        code_postal: code_postal,
        prenom: prenom,
        nom: nom,
      })
      .single();

    if (error) throw error;
    window.location.reload();
  } catch (error) {
    alert(error.message);
  }
}
