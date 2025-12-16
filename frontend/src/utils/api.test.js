import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCurrentUser } from "./api";
import { fetchWithAuth } from "./fetchWithAuth";

// On mocke le module voisin fetchWithAuth
vi.mock("./fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));

describe("api.js - fetchCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne l'objet user s'il est présent dans la réponse", async () => {
    const mockResponse = { user: { id: 1, nom: "Test" } };
    fetchWithAuth.mockResolvedValue(mockResponse);

    const result = await fetchCurrentUser("token");

    expect(result).toEqual(mockResponse.user);
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/api/users/me"),
      {},
      "token"
    );
  });

  it("retourne la réponse complète si 'user' n'est pas une clé racine", async () => {
    const mockResponse = { id: 2, nom: "Direct" };
    fetchWithAuth.mockResolvedValue(mockResponse);

    const result = await fetchCurrentUser("token");

    expect(result).toEqual(mockResponse);
  });

  it("lance une erreur si la réponse contient un champ error", async () => {
    fetchWithAuth.mockResolvedValue({ error: "Token invalide" });

    await expect(fetchCurrentUser("token")).rejects.toThrow("Token invalide");
  });

  it("lance une erreur si la réponse est nulle", async () => {
    fetchWithAuth.mockResolvedValue(null);
    await expect(fetchCurrentUser("token")).rejects.toThrow(); 
  });
});