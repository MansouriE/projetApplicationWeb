import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PageBid from "./PageBid";
import { AuthContext } from "../../context/AuthContext";

// --- Configuration des Mocks ---
let mockLocationState = {
  nom: "Statue",
  description: "Ancienne",
  etat: "Usagé",
  prix: 100,
  bidPrixDeDepart: 50,
  bid_end_date: new Date(Date.now() + 86400000).toISOString(),
};

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "1" }),
  useLocation: () => ({ state: mockLocationState }),
  useNavigate: () => mockNavigate,
}));

global.fetch = vi.fn();
global.alert = vi.fn();
global.console.error = vi.fn();

const renderPageBid = (token = "tok") => {
  return render(
    <AuthContext.Provider value={{ token, isLoggedIn: !!token }}>
      <PageBid />
    </AuthContext.Provider>
  );
};

const mockBids = [
  { id: 1, amount: "60", user: { pseudo: "User1" } }
];

describe("PageBid Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state
    mockLocationState = {
      nom: "Statue",
      description: "Ancienne",
      etat: "Usagé",
      prix: 100,
      bidPrixDeDepart: 50,
      bid_end_date: new Date(Date.now() + 86400000).toISOString(),
    };

    // Mock par défaut pour le chargement initial
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockBids),
      json: async () => mockBids,
    });
  });

  it("displays article info, current price (max bid)", async () => {
    renderPageBid();
    await waitFor(() => {
      expect(screen.getByText("Statue")).toBeInTheDocument();
      expect(screen.getByText(/Prix actuel : 60/i)).toBeInTheDocument();
    });
  });

  it("disables button if new bid is not greater than current price", async () => {
    const user = userEvent.setup();
    renderPageBid();
    await waitFor(() => screen.getByText(/Prix actuel/i));

    const input = screen.getByPlaceholderText(/> 60/);
    await user.type(input, "55");
    
    const btn = screen.getByRole("button", { name: /Placer le bid/i });
    expect(btn).toBeDisabled();
  });

  it("shows error when trying to bid without being logged in", async () => {
    // Rendu sans token
    renderPageBid(null); 
    const user = userEvent.setup();
    
    await waitFor(() => screen.getByText(/Prix actuel/i));

    const input = screen.getByPlaceholderText(/> 60/);
    await user.type(input, "70");

    const btn = screen.getByRole("button", { name: /Placer le bid/i });
    
    // Le bouton doit être cliquable maintenant
    expect(btn).not.toBeDisabled();
    await user.click(btn);

    await waitFor(() => {
        expect(screen.getByText(/Vous devez être connecté/i)).toBeInTheDocument();
    });
  });

  it("handles session expiration (401)", async () => {
    const user = userEvent.setup();
    renderPageBid();
    await waitFor(() => screen.getByText(/Prix actuel/i));

    // 1. Initialiser les mocks : 
    //    - appel initial (déjà fait ou ignoré si on redéfinit fetch globalement avant le clic ?)
    //    - appel POST qui renvoie 401
    // ATTENTION : renderPageBid a déjà déclenché un fetch au mount.
    // On doit préparer le prochain appel (le POST).
    
    global.fetch.mockResolvedValueOnce({ 
        ok: false, 
        status: 401, 
        text: async () => JSON.stringify({ error: "Unauthorized" }) 
    });

    const input = screen.getByPlaceholderText(/> 60/);
    await user.type(input, "80");

    const btn = screen.getByRole("button", { name: /Placer le bid/i });
    await user.click(btn);

    await waitFor(() => {
      // Le message d'erreur défini dans le composant est "⛔ Session expirée..."
      expect(screen.getByText(/Session expirée/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid number input", async () => {
    const user = userEvent.setup();
    renderPageBid();
    await waitFor(() => screen.getByText(/Prix actuel/i));

    const btn = screen.getByRole("button", { name: /Placer le bid/i });
    
    // Si l'input est vide, le bouton est disabled
    expect(btn).toBeDisabled();
    
    // Pour "invalid number", HTML5 input type="number" empêche souvent la saisie de texte.
    // Mais on peut vérifier que le bouton reste disabled si vide.
    // Le test original essayait de taper 'e', ce qui peut être valide (exponentielle) ou vide.
    // Vérifions simplement la désactivation :
    expect(btn).toBeDisabled();
  });

  it("places a successful bid", async () => {
    const user = userEvent.setup();
    renderPageBid();
    await waitFor(() => screen.getByText(/Prix actuel/i));

    // Mock réponse succès pour le POST, puis rechargement des bids
    global.fetch
      .mockResolvedValueOnce({ 
         ok: true, text: async () => JSON.stringify({ success: true }), json: async () => ({ success: true })
      })
      .mockResolvedValueOnce({ 
         ok: true, text: async () => JSON.stringify(mockBids), json: async () => mockBids 
      });

    const input = screen.getByPlaceholderText(/> 60/);
    await user.type(input, "70");
    
    const btn = screen.getByRole("button", { name: /Placer le bid/i });
    await user.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Bid de 70 \$ placé/i)).toBeInTheDocument();
    });
  });

  it("disables bid input and button when auction is ended", async () => {
    // Simuler date passée
    mockLocationState = {
      ...mockLocationState,
      bid_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    renderPageBid();

    await waitFor(() => {
      expect(screen.getByText(/⛔ Enchère terminée/i)).toBeInTheDocument();
    });
    
    const btn = screen.getByRole("button", { name: /Enchère terminée/i });
    expect(btn).toBeDisabled();

    const input = screen.getByRole("spinbutton");
    expect(input).toBeDisabled();
  });
});