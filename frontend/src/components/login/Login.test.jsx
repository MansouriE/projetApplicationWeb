import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login"; // Chemin ajusté
import { AuthContext } from "../../context/AuthContext"; 

// Mocks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
global.fetch = vi.fn();
global.alert = vi.fn();
vi.spyOn(console, 'error').mockImplementation(() => {});


const renderWithAuth = (authContextValue) => {
  return render(
    <AuthContext.Provider value={authContextValue}>
      <Login />
    </AuthContext.Provider>
  );
};

const authContextValue = { login: mockLogin };

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Connexion réussie
  it("calls login context and navigates to /profile on successful API response", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockToken = "success-token";
    const mockUserId = 5;
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: { id: mockUserId } }),
    });

    renderWithAuth(authContextValue);

    // Act
    await user.type(screen.getByPlaceholderText(/Entrez votre email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/Entrez votre mot de passe/i), "password123");
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(mockToken, mockUserId);
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });
  });

  // Test 2: Échec de connexion (réponse non-ok de l'API)
  it("shows alert on unsuccessful API response", async () => {
    // Arrange
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    renderWithAuth(authContextValue);

    // Act
    await user.type(screen.getByPlaceholderText(/Entrez votre email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/Entrez votre mot de passe/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.alert).toHaveBeenCalledWith(
        `Invalid credentials`
      );
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  // Test 3: Échec de connexion (erreur réseau/serveur)
  it("shows server error alert on fetch failure", async () => {
    // Arrange
    const user = userEvent.setup();
    const networkError = new Error("Network failed");
    global.fetch.mockRejectedValueOnce(networkError);

    renderWithAuth(authContextValue);

    // Act
    await user.type(screen.getByPlaceholderText(/Entrez votre email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/Entrez votre mot de passe/i), "password123");
    await user.click(screen.getByRole("button", { name: /Se connecter/i }));

    // Assert
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        `Erreur serveur : ${networkError.message}`
      );
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});