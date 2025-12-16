import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditProfile from "./UpdateProfile";
import { AuthContext } from "../../context/AuthContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

// Mocks
vi.mock("../../utils/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../acessGuard/accessGuard", () => ({ 
  default: ({ children }) => <div>{children}</div> 
}));
vi.mock("../common/SvgIcon", () => ({ default: () => <svg /> }));

const renderEditProfile = () => {
  return render(
    <AuthContext.Provider value={{ token: "tok", isLoggedIn: true }}>
      <EditProfile />
    </AuthContext.Provider>
  );
};

const mockUserData = {
  prenom: "Alice",
  nom: "Wonder",
  courriel: "alice@test.com",
  adresse: "",
  code_postal: "",
};

describe("UpdateProfile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock du GET initial
    fetchWithAuth.mockResolvedValue({ user: mockUserData });
  });

  it("pré-remplit le formulaire avec les données actuelles", async () => {
    renderEditProfile();

    await waitFor(() => {
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Wonder")).toBeInTheDocument();
      expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
    });
  });

  it("met à jour le profil avec succès", async () => {
    renderEditProfile();
    await waitFor(() => screen.getByDisplayValue("Alice"));

    // Modification d'un champ
    const nameInput = screen.getByDisplayValue("Wonder");
    fireEvent.change(nameInput, { target: { value: "Wonderland" } });

    // Mock de la réponse PATCH
    fetchWithAuth.mockResolvedValueOnce({ success: true });

    // Soumission
    const submitBtn = screen.getByText(/Enregistrer les modifications/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Vérifier le payload envoyé (seuls les champs non vides sont envoyés selon la logique du composant)
      expect(fetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/me"),
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining('"nom":"Wonderland"'),
        }),
        "tok"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
    });
  });

  it("affiche une erreur si l'API échoue", async () => {
    renderEditProfile();
    await waitFor(() => screen.getByDisplayValue("Alice"));

    // Mock erreur
    fetchWithAuth.mockResolvedValueOnce({ error: "Email invalide" });

    const submitBtn = screen.getByText(/Enregistrer les modifications/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Email invalide")).toBeInTheDocument();
    });
  });
});