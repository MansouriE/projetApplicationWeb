import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AccessGuard from "./AccessGuard";

// Mocks des composants enfants pour isoler la logique
vi.mock("./GuardCard", () => ({
  default: ({ title, message, children }) => (
    <div data-testid="guard-card">
      {title && <h1>{title}</h1>}
      {message && <p>{message}</p>}
      {children}
    </div>
  ),
}));

vi.mock("./GuardIcon", () => ({
  default: () => <span data-testid="guard-icon" />,
}));

describe("AccessGuard Component", () => {
  // Mock de window.location.reload
  const originalLocation = window.location;
  beforeEach(() => {
    delete window.location;
    window.location = { reload: vi.fn() };
  });
  afterEach(() => {
    window.location = originalLocation;
  });

  it("affiche le contenu protégé si tout est OK", () => {
    render(
      <AccessGuard loading={false} isLoggedIn={true} error={null}>
        <div data-testid="protected-content">Secret</div>
      </AccessGuard>
    );
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("guard-card")).not.toBeInTheDocument();
  });

  it("affiche le chargement si loading est true", () => {
    render(
      <AccessGuard loading={true} isLoggedIn={true} error={null}>
        <div>Secret</div>
      </AccessGuard>
    );
    expect(screen.getByText("Chargement…")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("affiche une erreur si error est présent (prioritaire sur loading/auth)", () => {
    render(
      <AccessGuard loading={false} isLoggedIn={true} error="Erreur Fatale">
        <div>Secret</div>
      </AccessGuard>
    );
    expect(screen.getByText("Erreur")).toBeInTheDocument(); // Titre
    expect(screen.getByText("Erreur Fatale")).toBeInTheDocument(); // Message
    expect(screen.getByRole("button", { name: /Réessayer/i })).toBeInTheDocument();
  });

  it("recharge la page au clic sur Réessayer", () => {
    render(
      <AccessGuard loading={false} isLoggedIn={true} error="Bug">
        <div>Secret</div>
      </AccessGuard>
    );
    const btn = screen.getByRole("button", { name: /Réessayer/i });
    fireEvent.click(btn);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("affiche accès non autorisé si non connecté", () => {
    render(
      <AccessGuard loading={false} isLoggedIn={false} error={null}>
        <div>Secret</div>
      </AccessGuard>
    );
    expect(screen.getByText("Accès non autorisé")).toBeInTheDocument();
    expect(screen.getByText(/Vous devez être connecté/i)).toBeInTheDocument();
  });
});