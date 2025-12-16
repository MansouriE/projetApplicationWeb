import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthContext, AuthProvider } from "./AuthContext";
import { useContext } from "react";

// Composant de test pour consommer le contexte
const TestConsumer = () => {
  const { isLoggedIn, token, userId, login, logout } = useContext(AuthContext);
  return (
    <div>
      <p data-testid="status">{isLoggedIn ? "Logged In" : "Logged Out"}</p>
      <p data-testid="token">{token}</p>
      <p data-testid="userId">{userId}</p>
      <button onClick={() => login("fake-token", "123")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("fournit les valeurs par défaut (non connecté)", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("Logged Out");
    expect(screen.getByTestId("token")).toBeEmptyDOMElement();
  });

  it("permet de se connecter et sauvegarde dans le localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("Logged In");
    expect(screen.getByTestId("token")).toHaveTextContent("fake-token");
    expect(screen.getByTestId("userId")).toHaveTextContent("123");
    
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(localStorage.getItem("userId")).toBe("123");
  });

  it("restaure la session depuis le localStorage au chargement", () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("userId", "456");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("Logged In");
    expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
    expect(screen.getByTestId("userId")).toHaveTextContent("456");
  });

  it("permet de se déconnecter", async () => {
    // On part d'un état connecté via localStorage pour simplifier l'init
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("userId", "789");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Vérification de l'état initial connecté
    expect(screen.getByTestId("status")).toHaveTextContent("Logged In");

    // Action de déconnexion
    await act(async () => {
      screen.getByText("Logout").click();
    });

    // Vérification de l'état déconnecté
    expect(screen.getByTestId("status")).toHaveTextContent("Logged Out");
    expect(localStorage.getItem("token")).toBeNull();
  });
});