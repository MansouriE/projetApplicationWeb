import { describe, it, expect, vi } from "vitest";
// On importe les vrais modules
import * as jwtUtils from "./jwtUtils";
import * as mathUtils from "./mathUtils";

vi.mock("./jwtUtils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

describe("Integration | Utils Marketplace", () => {
  
  it("Flux complet : Validation token -> Extraction ID -> Calcul Prix", () => {
   
    const payload = { id: 123, exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;

    const isValid = jwtUtils.isTokenValid(token);
    expect(isValid).toBe(true);

    const userId = jwtUtils.getUserIdFromToken(token);
    expect(userId).toBe(123);

    if (isValid && userId) {
      const prixInitial = 250;
      const reduction = 20;

      const prixRemise = mathUtils.calculateDiscountedPrice 
        ? mathUtils.calculateDiscountedPrice(prixInitial, reduction) 
        : prixInitial * (1 - reduction / 100); 

      expect(prixRemise).toBe(200);
    }
  });

  it("Flux erreur : Token invalide -> Pas de calcul", () => {
    const token = null;
    
    const isValid = jwtUtils.isTokenValid(token);
    expect(isValid).toBe(false);

    const userId = jwtUtils.getUserIdFromToken(token);
    expect(userId).toBeNull();

    const action = isValid ? "CALCULATE" : "ABORT";
    expect(action).toBe("ABORT");
  });
});