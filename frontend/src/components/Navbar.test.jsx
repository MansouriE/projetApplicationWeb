import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthContext } from "../context/AuthContext";

// Mock SvgIcon
vi.mock("./common/SvgIcon", () => ({
  default: () => <svg data-testid="svg-icon" />,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderNavbar = (isLoggedIn = false, logout = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche les liens publics si non connecté", () => {
    renderNavbar(false);
    
    // Logo
    expect(screen.getByText("Market")).toBeInTheDocument();
    
    // Liens Desktop (hidden on mobile via CSS but present in DOM)
    // On utilise getAllByText car les liens peuvent être dupliqués dans le menu mobile s'il était ouvert (il est fermé par défaut)
    // Ici le menu mobile est fermé, donc on ne devrait voir qu'une instance des liens desktop si le menu mobile ne rend pas son contenu conditionnellement
    // Votre code : {isMobileMenuOpen && (...)} -> donc pas de duplication initiale.
    
    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
    expect(screen.queryByText("Profil")).not.toBeInTheDocument();
  });

  it("affiche les liens privés si connecté", () => {
    renderNavbar(true);

    expect(screen.getByText("Profil")).toBeInTheDocument();
    expect(screen.getByText("Offres")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Déconnexion")).toBeInTheDocument();
    
    expect(screen.queryByText("Connexion")).not.toBeInTheDocument();
  });

  it("gère la déconnexion", () => {
    const logoutMock = vi.fn();
    renderNavbar(true, logoutMock);

    const logoutBtn = screen.getByText("Déconnexion");
    fireEvent.click(logoutBtn);

    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("ouvre et ferme le menu mobile", () => {
    renderNavbar(true);

    // Le bouton toggle est visible en mobile (md:hidden).
    // On le trouve car c'est un bouton contenant le SvgIcon
    const toggleBtn = screen.getByRole("button", { name: "" }); // SvgIcon inside
    
    // 1. Ouvrir le menu
    fireEvent.click(toggleBtn);
    
    // Maintenant on doit avoir 2 liens "Accueil" (1 desktop + 1 mobile)
    const links = screen.getAllByText("Accueil");
    expect(links).toHaveLength(2);

    // 2. Cliquer sur un lien mobile ferme le menu
    // Le lien mobile est le deuxième "Accueil" (car rendu après)
    fireEvent.click(links[1]);
    
    // Le menu devrait se fermer, donc plus qu'un seul lien "Accueil"
    expect(screen.getAllByText("Accueil")).toHaveLength(1);
  });
});