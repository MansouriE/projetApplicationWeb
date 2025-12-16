import { describe, it, expect } from 'vitest';
import { jwtUtils } from './jwtUtils.js';

describe('Integration | utils marketplace', () => {
  it('roundtrip JWT: signe puis vérifie le payload complet', () => {
    const payload = { userId: 999, email: 'integration@test.com' };
    const token = jwtUtils.signToken(payload);
    const decoded = jwtUtils.verifyToken(token);

    expect(decoded).toMatchObject(payload);
    expect(token.split('.')).toHaveLength(3);
  });

  it('rejette un token mal formé avec le message attendu', () => {
    expect(() => jwtUtils.verifyToken('foo.bar')).toThrow('Format de token invalide');
  });

  it('enchaîne remise puis taxe et formatage prix', () => {
    const discounted = jwtUtils.calculateDiscount(250, 20); // 200
    const totalTTC = jwtUtils.calculateTotalWithTax(discounted, 0.2); // 240
    const formatted = jwtUtils.formatPrice(totalTTC);

    expect(discounted).toBe(200);
    expect(totalTTC).toBe(240);
    expect(formatted).toBe('$240.00');
  });
});
