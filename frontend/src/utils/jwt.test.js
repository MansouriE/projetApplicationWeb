import { describe, it, expect } from 'vitest';


export const jwtUtils = {
  signToken: (payload) => {

    const header = { alg: 'HS256', typ: 'JWT' };
    const payloadBase64 = btoa(JSON.stringify(payload));
    const signature = 'simulated_signature';
    return `${btoa(JSON.stringify(header))}.${payloadBase64}.${signature}`;
  },
  
  verifyToken: (token) => {
    if (!token || typeof token !== 'string') {
      throw new Error('Token invalide');
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Format de token invalide');
    }
    
    try {
      const payloadStr = atob(parts[1]);
      return JSON.parse(payloadStr);
    } catch {
      throw new Error('Token corrompu');
    }
  },
  
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePassword: (password) => {
    if (!password || password.length < 6) {
      return false;
    }
    return true;
  },
  
  formatPrice: (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      throw new Error('Prix invalide');
    }
    return `$${price.toFixed(2)}`;
  },
  
  calculateDiscount: (originalPrice, discountPercent) => {
    if (originalPrice <= 0) throw new Error('Prix original invalide');
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Pourcentage de réduction invalide');
    }
    
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;
    return Math.round(finalPrice * 100) / 100;
  },
  
  isBidActive: (endDate) => {
    if (!endDate) return false;
    const now = new Date();
    const end = new Date(endDate);
    return now < end;
  },
  
  calculateTotalWithTax: (subtotal, taxRate = 0.15) => {
    if (subtotal < 0) throw new Error('Sous-total invalide');
    const tax = subtotal * taxRate;
    return Math.round((subtotal + tax) * 100) / 100;
  },
  
  validateAddress: (address, postalCode) => {
    const errors = [];
    
    if (!address || address.trim().length < 5) {
      errors.push('Adresse trop courte');
    }
    
    if (!postalCode || !/^[A-Z0-9]{3,10}$/.test(postalCode)) {
      errors.push('Code postal invalide');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  

  formatDate: (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Date invalide');
    }
    return date.toISOString().split('T')[0];
  }
};

describe('Utils Marketplace - Tests Unitaires', () => {
  describe('JWT Utils', () => {
    it('DEVRAIT créer un token JWT valide', () => {
      const payload = { userId: 123, email: 'test@example.com' };
      const token = jwtUtils.signToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
    
    it('DEVRAIT vérifier et décoder un token valide', () => {
      const payload = { userId: 456, email: 'user@test.com' };
      const token = jwtUtils.signToken(payload);
      const decoded = jwtUtils.verifyToken(token);
      
      expect(decoded.userId).toBe(456);
      expect(decoded.email).toBe('user@test.com');
    });
    
    it('DEVRAIT lever une erreur pour token invalide', () => {
      expect(() => jwtUtils.verifyToken('invalid.token')).toThrow('Format de token invalide');
      expect(() => jwtUtils.verifyToken('')).toThrow('Token invalide');
      expect(() => jwtUtils.verifyToken(null)).toThrow('Token invalide');
    });
  });
  
  describe('Validation Utils', () => {
    it('DEVRAIT valider les emails correctement', () => {
      expect(jwtUtils.validateEmail('test@example.com')).toBe(true);
      expect(jwtUtils.validateEmail('user.name@domain.co')).toBe(true);
      expect(jwtUtils.validateEmail('invalid-email')).toBe(false);
      expect(jwtUtils.validateEmail('@domain.com')).toBe(false);
      expect(jwtUtils.validateEmail('')).toBe(false);
    });
    
    it('DEVRAIT valider les mots de passe', () => {
      expect(jwtUtils.validatePassword('password123')).toBe(true);
      expect(jwtUtils.validatePassword('123456')).toBe(true);
      expect(jwtUtils.validatePassword('12345')).toBe(false);
      expect(jwtUtils.validatePassword('')).toBe(false);
      expect(jwtUtils.validatePassword(null)).toBe(false);
    });
    
    it('DEVRAIT valider les adresses', () => {
      const validResult = jwtUtils.validateAddress('123 Rue Principale', 'H3A1A1');
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      const invalidResult = jwtUtils.validateAddress('Rue', 'ABC');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Adresse trop courte');
    });
  });
  
  describe('Price Utils', () => {
    it('DEVRAIT formater les prix correctement', () => {
      expect(jwtUtils.formatPrice(100)).toBe('$100.00');
      expect(jwtUtils.formatPrice(50.5)).toBe('$50.50');
      expect(jwtUtils.formatPrice(0.99)).toBe('$0.99');
      expect(jwtUtils.formatPrice(1234.567)).toBe('$1234.57');
    });
    
    it('DEVRAIT lever une erreur pour prix invalide', () => {
      expect(() => jwtUtils.formatPrice('invalid')).toThrow('Prix invalide');
      expect(() => jwtUtils.formatPrice(NaN)).toThrow('Prix invalide');
      expect(() => jwtUtils.formatPrice(null)).toThrow('Prix invalide');
    });
    
    it('DEVRAIT calculer les réductions', () => {
      expect(jwtUtils.calculateDiscount(100, 10)).toBe(90);
      expect(jwtUtils.calculateDiscount(50, 20)).toBe(40);
      expect(jwtUtils.calculateDiscount(33.33, 25)).toBe(25);
      expect(jwtUtils.calculateDiscount(100, 0)).toBe(100);
      expect(jwtUtils.calculateDiscount(100, 100)).toBe(0);
      expect(jwtUtils.calculateDiscount(33.33, 10)).toBe(30); 
    });
    
    it('DEVRAIT lever une erreur pour réduction invalide', () => {
      expect(() => jwtUtils.calculateDiscount(-10, 20)).toThrow('Prix original invalide');
      expect(() => jwtUtils.calculateDiscount(100, -5)).toThrow('Pourcentage de réduction invalide');
      expect(() => jwtUtils.calculateDiscount(100, 150)).toThrow('Pourcentage de réduction invalide');
    });
    
    it('DEVRAIT calculer le total avec taxes', () => {
      expect(jwtUtils.calculateTotalWithTax(100)).toBe(115);
      expect(jwtUtils.calculateTotalWithTax(50, 0.20)).toBe(60);
      expect(jwtUtils.calculateTotalWithTax(33.33)).toBeCloseTo(38.33, 2);
    });
    
    it('DEVRAIT lever une erreur pour sous-total invalide', () => {
      expect(() => jwtUtils.calculateTotalWithTax(-10)).toThrow('Sous-total invalide');
    });
  });
  
  describe('Bid Utils', () => {
    it('DEVRAIT vérifier si un bid est actif', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(jwtUtils.isBidActive(futureDate.toISOString())).toBe(true);
      expect(jwtUtils.isBidActive(pastDate.toISOString())).toBe(false);
      expect(jwtUtils.isBidActive(null)).toBe(false);
      expect(jwtUtils.isBidActive(undefined)).toBe(false);
      expect(jwtUtils.isBidActive('')).toBe(false);
    });
  });
  
  describe('Date Utils', () => {
    it('DEVRAIT formater une date correctement', () => {
      const date = new Date('2024-12-15');
      expect(jwtUtils.formatDate(date)).toBe('2024-12-15');
      
      const date2 = new Date('2023-06-01T10:30:00Z');
      expect(jwtUtils.formatDate(date2)).toBe('2023-06-01');
    });
    
    it('DEVRAIT lever une erreur pour date invalide', () => {
      expect(() => jwtUtils.formatDate('invalid')).toThrow('Date invalide');
      expect(() => jwtUtils.formatDate(null)).toThrow('Date invalide');
      expect(() => jwtUtils.formatDate(new Date('invalid'))).toThrow('Date invalide');
    });
  });
});