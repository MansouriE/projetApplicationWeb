import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AccessGuard from "../acessGuard/accessGuard";

export default function EditProfile() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    adresse: "",
    code_postal: "",
    courriel: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(
          "https://projetapplicationweb-1.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Impossible de charger le profil");

        const u = data.user || data;
        setForm({
          prenom: u.prenom || "",
          nom: u.nom || "",
          adresse: u.adresse || "",
          code_postal: u.code_postal || "",
          courriel: u.courriel || "",
        });
        setLoading(false);
      } catch (e) {
        setError(e.message || "Une erreur est survenue");
        setLoading(false);
      }
    };
    if (isLoggedIn) run();
  }, [isLoggedIn, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => String(v ?? "").trim() !== "")
    );

    try {
      const res = await fetch(
        "https://projetapplicationweb-1.onrender.com/api/users/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mise à jour échouée");

      navigate("/profile", { replace: true });
    } catch (e) {
      setError(e.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AccessGuard isLoggedIn={isLoggedIn} loading={loading}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-800 px-6 py-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {form.prenom?.[0]?.toUpperCase() ||
                        form.nom?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Modifier le profil
                    </h1>
                    <p className="text-purple-200">
                      Mettez à jour vos informations personnelles
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Prénom *
                      </label>
                      <input
                        name="prenom"
                        type="text"
                        value={form.prenom}
                        onChange={onChange}
                        placeholder="Votre prénom"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nom *
                      </label>
                      <input
                        name="nom"
                        type="text"
                        value={form.nom}
                        onChange={onChange}
                        placeholder="Votre nom"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        name="courriel"
                        type="email"
                        value={form.courriel}
                        onChange={onChange}
                        placeholder="exemple@mail.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Code postal
                      </label>
                      <input
                        name="code_postal"
                        type="text"
                        value={form.code_postal}
                        onChange={onChange}
                        placeholder="H0H 0H0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Adresse
                      </label>
                      <input
                        name="adresse"
                        type="text"
                        value={form.adresse}
                        onChange={onChange}
                        placeholder="Votre adresse complète"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Enregistrer les modifications
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-8 rounded-lg transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AccessGuard>
    </>
  );
}
