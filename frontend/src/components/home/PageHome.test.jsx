import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./PageHome";
import { AuthContext } from "../../context/AuthContext";

global.fetch = vi.fn();
// Mock du composant enfant pour isoler le test
vi.mock("./Article", () => ({
  default: ({ nom }) => <div data-testid="article-item">{nom}</div>,
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <a>{children}</a>,
}));

const mockArticles = [
  { id_articles: 1, nom: "Laptop", prix: 1000 },
  { id_articles: 2, nom: "Mouse", prix: 20 },
];

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = (loggedIn = false) => {
    return render(
      <AuthContext.Provider value={{ isLoggedIn: loggedIn }}>
        <HomePage />
      </AuthContext.Provider>
    );
  };

  it("fetches and displays all articles on mount", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Mouse")).toBeInTheDocument();
    });
  });

  it("fetches articles with search query after debounce", async () => {
    // 1er appel: chargement initial
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockArticles,
    });
    // 2ème appel: recherche
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id_articles: 1, nom: "Laptop" }],
    });

    renderHome();
    const user = userEvent.setup();

    // Attendre le chargement initial
    await waitFor(() => expect(screen.getByText("Mouse")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    await user.type(searchInput, "Lap");

    // waitFor va attendre que le debounce passe et que le 2ème fetch se fasse
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("search=Lap")
      );
    }, { timeout: 2000 }); // Délai un peu plus long pour le debounce
  });

  it("shows 'Ajouter un article' button if logged in", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    renderHome(true);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Ajouter un article/i })).toBeInTheDocument();
    });
  });
});