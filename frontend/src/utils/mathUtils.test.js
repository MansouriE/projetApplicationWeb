import { describe, it, expect } from "vitest";
import { calculateArticlePrice } from "./mathUtils";

describe("calculateArticlePrice", () => {
  it("DEVRAIT lever une erreur pour réduction négative", () => {
  expect(() => calculateArticlePrice(100, 2, -10))
    .toThrowError("INVALID_DISCOUNT");
});

it("DEVRAIT lever une erreur pour réduction > 100%", () => {
  expect(() => calculateArticlePrice(100, 2, 150))
    .toThrowError("INVALID_DISCOUNT");
});

it("DEVRAIT lever une erreur pour quantité <= 0", () => {
  expect(() => calculateArticlePrice(100, 0))
    .toThrowError("INVALID_QUANTITY");
});

it("DEVRAIT accepter une réduction de 0% (valeur par défaut)", () => {
  const result1 = calculateArticlePrice(100, 2, 0);
  const result2 = calculateArticlePrice(100, 2);
  expect(result1).toBe(200);
  expect(result2).toBe(200);
});

it("DEVRAIT accepter une réduction de 100% (article gratuit)", () => {
  const result = calculateArticlePrice(100, 2, 100);
  expect(result).toBe(0);
});
});