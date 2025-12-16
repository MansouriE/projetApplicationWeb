import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Profile from "./Profile";
import { AuthContext } from "../../context/AuthContext";
import { fetchCurrentUser } from "../../utils/api";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
// Mock du composant Article pour simplifier le rendu
import Article from "../home/Article";

vi.mock("../home/Article", () => ({
  default: ({ nom, onEdit, onDelete }) => (
    <div data-testid="article-card">
      <span>{nom}</span>
      {onEdit && <button onClick={onEdit}>Modifier {nom}</button>}
      {onDelete && <button onClick={onDelete}>Supprimer {nom}</button>}
    </div>
  ),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../utils/api", () => ({
  fetchCurrentUser: vi.fn(),
}));

vi.mock("../../utils/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));

global.confirm = vi.fn(() => true);

const mockUser = { prenom: "Jean", nom: "Dupond" };
const mockMyArticles = [{ id_articles: 1, nom: "Mon Velo", isProfilePage: true }];
const mockFavArticles = [{ id_articles: 2, nom: "Ta Voiture", isProfilePage: true }];

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCurrentUser.mockResolvedValue(mockUser);
    
    fetchWithAuth.mockImplementation((url, options) => {
      if (options?.method === "DELETE") return Promise.resolve({ success: true });
      if (url.includes("getMesArticlesFavori")) return Promise.resolve(mockFavArticles);
      if (url.includes("getMesArticles")) return Promise.resolve(mockMyArticles);
      return Promise.resolve([]);
    });
  });

  it("fetches user data and articles on mount", async () => {
    render(
      <AuthContext.Provider value={{ isLoggedIn: true, token: "tok" }}>
        <Profile />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Jean Dupond")).toBeInTheDocument();
      expect(screen.getByText("Mon Velo")).toBeInTheDocument();
      expect(screen.getByText("Ta Voiture")).toBeInTheDocument();
    });
  });

  it("handles article deletion", async () => {
    const user = userEvent.setup();
    render(
      <AuthContext.Provider value={{ isLoggedIn: true, token: "tok" }}>
        <Profile />
      </AuthContext.Provider>
    );

    // Attendre l'affichage
    await waitFor(() => screen.getByText("Mon Velo"));

    // Trouver le bouton supprimer spécifique
    const deleteBtn = screen.getByRole("button", { name: "Supprimer Mon Velo" });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(fetchWithAuth).toHaveBeenCalledWith(
        expect.stringContaining("/articles/1"),
        expect.objectContaining({ method: "DELETE" }),
        "tok"
      );
    });
  });
});