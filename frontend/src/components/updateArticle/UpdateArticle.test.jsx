import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditArticle from "./UpdateArticle";
import { AuthContext } from "../../context/AuthContext";

// Mocks
const mockNavigate = vi.fn();
// Variable pour simuler le state de location
let mockLocationState = null;

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "123" }),
  useLocation: () => ({ state: mockLocationState }),
  useNavigate: () => mockNavigate,
}));

global.fetch = vi.fn();

const renderEditArticle = (token = "tok") => {
  return render(
    <AuthContext.Provider value={{ token, isLoggedIn: !!token }}>
      <EditArticle />
    </AuthContext.Provider>
  );
};

describe("UpdateArticle Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = null;
  });

  it("redirige si non connecté", () => {
    renderEditArticle(null);
    expect(screen.getByText(/Accès non autorisé/i)).toBeInTheDocument();
  });

  it("pré-remplit le formulaire via location.state sans appel API", async () => {
    mockLocationState = {
      nom: "Vieux Vélo",
      description: "Roule bien",
      prix: 50,
      etat: "Usagé"
    };

    renderEditArticle();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Vieux Vélo")).toBeInTheDocument();
      expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("charge l'article via API si location.state est vide", async () => {
    mockLocationState = null;
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nom: "Fetched Item",
        description: "From API",
        prix: 200,
        etat: "Neuf"
      }),
    });

    renderEditArticle();

    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Fetched Item")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/articles/123"),
      expect.anything()
    );
  });

  it("affiche une erreur de validation si champs vides", async () => {
    // Initialisation avec des champs vides
    mockLocationState = { nom: "", description: "", prix: 0 };
    const { container } = renderEditArticle();
    
    // Attendre que le formulaire soit affiché
    await waitFor(() => screen.getByText(/Modifier l’article/i));

    // Soumission directe du formulaire
    const form = container.querySelector('form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/Nom et description sont requis/i)).toBeInTheDocument();
    });
  });

  it("soumet les modifications avec succès", async () => {
    mockLocationState = {
      nom: "Item",
      description: "Desc",
      prix: 10,
      etat: "Neuf"
    };
    const { container } = renderEditArticle();
    await waitFor(() => screen.getByDisplayValue("Item"));

    // Le label n'a pas de 'htmlFor', on cible l'input par son attribut 'name'
    const prixInput = container.querySelector('input[name="prix"]');
    fireEvent.change(prixInput, { target: { value: "15" } });

    // Mock PUT success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Soumission directe
    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/articles/123"),
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"prix":15'),
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
    });
  });
});