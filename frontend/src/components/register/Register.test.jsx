import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./Register";

// Mocks
global.fetch = vi.fn();
global.alert = vi.fn();
// Supprimer les logs console.error attendus
vi.spyOn(console, 'error').mockImplementation(() => {});

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = async (user) => {
    // Utilisation des placeholders exacts pour éviter les conflits regex (ex: /Nom/ match Prénom)
    await user.type(screen.getByPlaceholderText("Entrez votre prénom"), "Jean");
    await user.type(screen.getByPlaceholderText("Entrez votre nom"), "Valjean");
    await user.type(screen.getByPlaceholderText("Entrez votre Pseudo"), "JV");
    await user.type(screen.getByPlaceholderText("Entrez votre Adresse"), "123 Rue");
    await user.type(screen.getByPlaceholderText("Entrez votre Code Postal"), "75001");
    await user.type(screen.getByPlaceholderText("Entrez votre email"), "jean@test.com");
    await user.type(screen.getByPlaceholderText("Entrez votre mot de passe"), "password123");
  };

  it("submits the form successfully and clears fields", async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { container } = render(<Register />);

    await fillForm(user);

    // Soumission via le bouton
    await user.click(screen.getByRole("button", { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Vérification reset
    expect(screen.getByPlaceholderText("Entrez votre prénom")).toHaveValue("");
  });

  it("shows alert if any required field is empty", async () => {
    const { container } = render(<Register />);
    
    // On ne remplit rien. On force la soumission du formulaire pour déclencher la validation JS.
    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(global.alert).toHaveBeenCalledWith("Veuillez remplir tous les champs !");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows alert on API error response", async () => {
    const user = userEvent.setup();
    const errorMessage = "User already exists";
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<Register />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Erreur : " + errorMessage);
    });
  });
});