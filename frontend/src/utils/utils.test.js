import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWithAuth } from "./fetchWithAuth";

global.fetch = vi.fn();

describe("Utils Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("fetchWithAuth", () => {
    it("ajoute le token dans les headers", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const res = await fetchWithAuth("http://api.com", {}, "my-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://api.com",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-token",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(res).toEqual(mockResponse);
    });

    it("lance une erreur avec le message du serveur si la réponse n'est pas OK", async () => {
      const errorMessage = "Erreur serveur";
      
      // Mock d'une réponse d'erreur
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => "application/json" },
        // fetchWithAuth essaie de lire data.error
        json: async () => ({ error: errorMessage }), 
        text: async () => JSON.stringify({ error: errorMessage }),
      });

      // On s'attend à ce que la fonction lance une exception
      await expect(fetchWithAuth("http://api.com", {}, "token"))
        .rejects
        .toThrow(errorMessage);
    });

    it("fusionne les options personnalisées", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => "application/json" },
            json: async () => ({}),
            text: async () => "{}",
        });
  
        await fetchWithAuth("http://api.com", { method: "POST", body: "data" }, "token");
  
        expect(global.fetch).toHaveBeenCalledWith(
          "http://api.com",
          expect.objectContaining({
            method: "POST",
            body: "data",
          })
        );
      });
  });
});