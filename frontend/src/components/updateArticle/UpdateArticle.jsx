// src/pages/articles/EditArticle.jsx
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = "https://projetapplicationweb-1.onrender.com";

export default function EditArticle() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const { id } = useParams();
  const { state } = useLocation(); // article passé depuis Profile via navigate(..., { state: article })
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    etat: "Disponible",
    // Enchères (facultatifs)
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Préremplir depuis location.state sinon fetch /api/articles/:id
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");

        if (state) {
          setForm({
            nom: state.nom ?? "",
            description: state.description ?? "",
            prix: String(state.prix ?? ""),
            etat: state.etat ?? "Disponible",
          });
          setLoading(false);
          return;
        }

        // Sinon on charge l’article par l’id
        const res = await fetch(`${API_BASE}/api/articles/${id}`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Impossible de charger l’article");

        setForm({
          nom: data.nom ?? "",
          description: data.description ?? "",
          prix: String(data.prix ?? ""),
          etat: data.etat ?? "Disponible",
        });
        setLoading(false);
      } catch (e) {
        setError(e.message || "Erreur au chargement");
        setLoading(false);
      }
    };

    bootstrap();
  }, [id, state]);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations simples
    if (!form.nom.trim() || !form.description.trim()) {
      return setError("Nom et description sont requis.");
    }
    const prixNum = Number(form.prix);
    if (!Number.isFinite(prixNum) || prixNum <= 0) {
      return setError("Prix invalide.");
    }

    setSaving(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        description: form.description.trim(),
        prix: prixNum,
        etat: form.etat,
      };

      const res = await fetch(`${API_BASE}/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Mise à jour échouée");

      navigate("/profile", { replace: true });
    } catch (e) {
      setError(e.message || "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Connectez-vous pour modifier un article.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l’article…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-800 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">
              Modifier l’article #{id}
            </h1>
            <p className="text-purple-200">
              Mettez à jour les informations de votre article
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  name="nom"
                  type="text"
                  value={form.nom}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Prix *
                  </label>
                  <input
                    name="prix"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.prix}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    État *
                  </label>
                  <select
                    name="etat"
                    value={form.etat}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {/* Doit matcher la validation backend */}
                    <option value="Neuf">Neuf</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Bon">Bon</option>
                    <option value="Usagé">Usagé</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-8 rounded-lg border border-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
