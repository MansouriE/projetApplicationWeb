import { describe, it, expect, vi } from "vitest";
vi.unmock("./jwtUtils");

import { isTokenValid, getUserIdFromToken } from "./jwtUtils";

// Helper pour créer un faux token JWT valide structurellement
const createMockToken = (payload) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
};

describe("jwtUtils", () => {
  it("les fonctions doivent être définies", () => {
    expect(isTokenValid).toBeDefined();
    expect(typeof isTokenValid).toBe("function");
    expect(getUserIdFromToken).toBeDefined();
    expect(typeof getUserIdFromToken).toBe("function");
  });

  describe("isTokenValid", () => {
    it("retourne false si le token est vide ou null", () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid(undefined)).toBe(false);
      expect(isTokenValid("")).toBe(false);
    });

    it("retourne false si le token est malformé (crash dans le try/catch)", () => {
      expect(isTokenValid("bad.token")).toBe(false);
      expect(isTokenValid("partie1.partie2")).toBe(false);
    });

    it("retourne false si le token est expiré", () => {
      const past = Math.floor(Date.now() / 1000) - 3600; // Il y a 1h
      const token = createMockToken({ exp: past });
      expect(isTokenValid(token)).toBe(false);
    });

    it("retourne true si le token est valide", () => {
      const future = Math.floor(Date.now() / 1000) + 3600; // Dans 1h
      const token = createMockToken({ exp: future });
      expect(isTokenValid(token)).toBe(true);
    });
  });

  describe("getUserIdFromToken", () => {
    it("retourne null si invalide ou vide", () => {
      expect(getUserIdFromToken(null)).toBe(null);
      expect(getUserIdFromToken("bad.token")).toBe(null);
    });

    it("extrait l'ID (id/userId/sub)", () => {
      const token1 = createMockToken({ id: 123 });
      expect(getUserIdFromToken(token1)).toBe(123);

      const token2 = createMockToken({ userId: 456 });
      expect(getUserIdFromToken(token2)).toBe(456);
    });
    
    it("retourne null si aucune clé d'ID n'est trouvée", () => {
        const token = createMockToken({ name: "User" });
        expect(getUserIdFromToken(token)).toBe(null);
    });
  });
});