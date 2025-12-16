import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Settings from "./Settings";
import { AuthContext } from "../../context/AuthContext";
import { fetchCurrentUser } from "../../utils/api";

// Mocks
vi.mock("../../utils/api", () => ({
  fetchCurrentUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../common/BackButton", () => ({ default: () => <button>Back</button> }));
vi.mock("../common/SvgIcon", () => ({ default: () => <svg /> }));
vi.mock("../acessGuard/accessGuard", () => ({ 
  default: ({ children }) => <div>{children}</div> 
}));

global.fetch = vi.fn();

const renderSettings = () => {
  return render(
    <AuthContext.Provider value={{ token: "tok", isLoggedIn: true }}>
      <Settings />
    </AuthContext.Provider>
  );
};

const mockUser = {
  prenom: "Jean",
  nom: "Dupont",
  courriel: "jean@test.com",
  adresse: "123 Rue",
  code_postal: "75000",
  pseudo: "JDP",
};

describe("Settings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche un chargement initialement", () => {
    // On retarde la résolution pour voir le loading
    fetchCurrentUser.mockReturnValue(new Promise(() => {}));
    renderSettings();
    expect(screen.getByText(/Chargement du profil/i)).toBeInTheDocument();
  });

  it("affiche les informations de l'utilisateur après chargement", async () => {
    fetchCurrentUser.mockResolvedValue(mockUser);
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText("Mes paramètres")).toBeInTheDocument();
    });

    expect(screen.getByText("Jean")).toBeInTheDocument();
    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("jean@test.com")).toBeInTheDocument();
    expect(screen.getByText("JDP")).toBeInTheDocument();
  });

  it("navigue vers la page d'édition au clic", async () => {
    fetchCurrentUser.mockResolvedValue(mockUser);
    renderSettings();

    await waitFor(() => screen.getByText("Mes paramètres"));

    const editBtn = screen.getByText(/Modifier mon profil/i);
    fireEvent.click(editBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/profile/edit");
  });

  it("recharge les articles au clic sur le bouton", async () => {
    fetchCurrentUser.mockResolvedValue(mockUser);
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderSettings();
    await waitFor(() => screen.getByText("Mes paramètres"));

    const refreshBtn = screen.getByText(/Actualiser les articles/i);
    fireEvent.click(refreshBtn);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://projetapplicationweb-1.onrender.com/api/getArticles"
    );
  });
});