import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Offres from "./Offres.jsx";
import { AuthContext } from "../../context/AuthContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

vi.mock("../../utils/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));
global.console.error = vi.fn();

const mockReceived = [{ id: 1, sender_id: 10, amount: 95, article_id: 501 }];
const mockSent = [{ id: 2, owner_id: 20, amount: 110, article_id: 502 }];

describe("Offres Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWithAuth.mockImplementation((url) => {
      if (url.includes("received")) return Promise.resolve(mockReceived);
      if (url.includes("sent")) return Promise.resolve(mockSent);
      return Promise.resolve([]);
    });
  });

  const renderOffres = () => {
    render(
      <AuthContext.Provider value={{ isLoggedIn: true, token: "tok" }}>
        <Offres />
      </AuthContext.Provider>
    );
  };

  it("fetches and displays received and sent offers", async () => {
    renderOffres();

    await waitFor(() => {
      // Vérifier les données fragmentées (plus robuste que de chercher une phrase entière)
      // Offres reçues
      expect(screen.getByText("10")).toBeInTheDocument(); // Sender ID
      expect(screen.getByText(/95/)).toBeInTheDocument(); // Montant
      expect(screen.getByText("501")).toBeInTheDocument(); // Article ID

      // Offres envoyées
      expect(screen.getByText(/110/)).toBeInTheDocument(); // Montant envoyé
      expect(screen.getByText("502")).toBeInTheDocument(); // Article ID
    });
  });

  it("calls DELETE API when Refuser is clicked", async () => {
    const user = userEvent.setup();
    renderOffres();

    // Le bouton Refuser
    const refuseBtn = await screen.findByRole("button", { name: /Refuser/i });
    
    // Mock le retour du delete
    fetchWithAuth.mockResolvedValueOnce({ success: true });

    await user.click(refuseBtn);

    await waitFor(() => {
      expect(fetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("/offers/1"),
        expect.objectContaining({ method: "DELETE" }),
        "tok"
      );
    });
  });
});