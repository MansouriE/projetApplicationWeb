import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

export const coverageUtils = {

  validateUserInput: (user) => {
    const errors = {};
    
    // Branche 1: Prénom
    if (!user.firstName || user.firstName.trim().length < 2) {
      errors.firstName = 'Prénom invalide';
    }
    
    // Branche 2: Nom
    if (!user.lastName || user.lastName.trim().length < 2) {
      errors.lastName = 'Nom invalide';
    }
    
    // Branche 3: Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      errors.email = 'Email invalide';
    }
    
    // Branche 4: Password
    if (!user.password || user.password.length < 6) {
      errors.password = 'Mot de passe trop court';
    } else if (user.password.length > 50) {
      errors.password = 'Mot de passe trop long';
    }
    
    // Branche 5: Âge
    if (user.age !== undefined) {
      if (user.age < 0) {
        errors.age = 'Âge négatif';
      } else if (user.age < 18) {
        errors.age = 'Doit être majeur';
      } else if (user.age > 120) {
        errors.age = 'Âge invalide';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  calculateTotal: (items, options = {}) => {
    let subtotal = 0;
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items invalides');
    }
    
    for (const item of items) {
      if (item.price < 0) {
        throw new Error('Prix négatif détecté');
      }
      if (item.quantity <= 0) {
        throw new Error('Quantité invalide');
      }
      subtotal += item.price * item.quantity;
    }
    
    let discount = 0;
    if (options.discountType === 'percentage') {
      if (options.discountValue < 0 || options.discountValue > 100) {
        throw new Error('Pourcentage de réduction invalide');
      }
      discount = subtotal * (options.discountValue / 100);
    } else if (options.discountType === 'fixed') {
      if (options.discountValue < 0) {
        throw new Error('Réduction fixe invalide');
      }
      discount = Math.min(options.discountValue, subtotal);
    }
    
    const taxRate = options.taxRate || 0.15;
    if (taxRate < 0 || taxRate > 1) {
      throw new Error('Taux de taxe invalide');
    }
    const tax = (subtotal - discount) * taxRate;
    
    let shipping = options.shipping || 0;
    if (shipping < 0) {
      throw new Error('Frais de livraison invalides');
    }
    if (options.freeShippingOver && subtotal >= options.freeShippingOver) {
      shipping = 0;
    }
    
    const total = subtotal - discount + tax + shipping;
    return Math.round(total * 100) / 100;
  },
  
  getArticleStatus: (article) => {
    if (!article || typeof article !== 'object') {
      return 'invalid';
    }
    
    if (article.isSold) {
      return 'sold';
    }
    
    if (article.bidEndDate && new Date(article.bidEndDate) < new Date()) {
      return 'bid_expired';
    }
    
    if (article.bidEndDate && new Date(article.bidEndDate) >= new Date()) {
      return 'bid_active';
    }
    
    if (article.hasOffers) {
      return 'has_offers';
    }
    
    if (article.quantity > 0) {
      return 'available';
    }
    
    return 'out_of_stock';
  },
  
  formatDisplayText: (text, maxLength = 50) => {
    if (text === null || text === undefined) {
      return '';
    }
    

    if (text.trim() === '') {
      return '(vide)';
    }
    
    if (text.length <= maxLength) {
      return text;
    }
    

    return text.substring(0, maxLength - 3) + '...';
  },
  

  formatRelativeDate: (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return 'Dans le futur';
    }
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes === 0) {
          return 'À l\'instant';
        }
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
    

    if (diffDays === 1) {
      return 'Hier';
    }
    

    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
    

    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    
    return 'Il y a plus d\'un mois';
  },
  
  checkUserPermissions: (user, requiredPermissions) => {
    if (!user) {
      return { allowed: false, reason: 'Non connecté' };
    }
    

    if (user.isBanned) {
      return { allowed: false, reason: 'Compte suspendu' };
    }

    if (user.role === 'admin') {
      return { allowed: true, reason: 'Admin' };
    }
    
    const missingPermissions = [];
    
    for (const perm of requiredPermissions) {
      if (!user.permissions || !user.permissions.includes(perm)) {
        missingPermissions.push(perm);
      }
    }
    
    if (missingPermissions.length > 0) {
      return {
        allowed: false,
        reason: `Permissions manquantes: ${missingPermissions.join(', ')}`
      };
    }
    
    return { allowed: true, reason: 'Autorisé' };
  }
};

describe('Coverage', () => {
  describe('validateUserInput', () => {
    it('DEVRAIT valider un utilisateur valide', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      };
      
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    it('DEVRAIT détecter un prénom invalide', () => {
      const user = { firstName: 'J', lastName: 'Doe', email: 'test@test.com', password: 'pass' };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe('Prénom invalide');
    });
    
    it('DEVRAIT détecter un nom invalide', () => {
      const user = { firstName: 'John', lastName: '', email: 'test@test.com', password: 'pass' };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.lastName).toBe('Nom invalide');
    });
    
    it('DEVRAIT détecter un email invalide', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'invalid', password: 'password' };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email invalide');
    });
    
    it('DEVRAIT détecter un mot de passe trop court', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: '123' };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Mot de passe trop court');
    });
    
    it('DEVRAIT détecter un mot de passe trop long', () => {
      const longPassword = 'a'.repeat(51);
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: longPassword };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Mot de passe trop long');
    });
    
    it('DEVRAIT détecter un âge négatif', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'password', age: -5 };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Âge négatif');
    });
    
    it('DEVRAIT détecter un mineur', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'password', age: 16 };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Doit être majeur');
    });
    
    it('DEVRAIT détecter un âge trop élevé', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'password', age: 150 };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Âge invalide');
    });
    
    it('DEVRAIT ignorer l\'âge si non fourni', () => {
      const user = { firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'password123' };
      const result = coverageUtils.validateUserInput(user);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('calculateTotal', () => {
    it('DEVRAIT calculer le total sans options', () => {
      const items = [{ price: 10, quantity: 2 }, { price: 5, quantity: 3 }];
      const total = coverageUtils.calculateTotal(items);
      expect(total).toBe(40.25);
    });
    
    it('DEVRAIT appliquer une réduction en pourcentage', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { discountType: 'percentage', discountValue: 20 };
      const total = coverageUtils.calculateTotal(items, options);
      expect(total).toBe(92);
    });
    
    it('DEVRAIT appliquer une réduction fixe', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { discountType: 'fixed', discountValue: 30 };
      const total = coverageUtils.calculateTotal(items, options);
      expect(total).toBe(80.5);
    });
    
    it('DEVRAIT appliquer la livraison gratuite', () => {
      const items = [{ price: 60, quantity: 1 }];
      const options = { shipping: 10, freeShippingOver: 50 };
      const total = coverageUtils.calculateTotal(items, options);
      expect(total).toBe(69);
    });
    
    it('DEVRAIT lever une erreur pour items invalides', () => {
      expect(() => coverageUtils.calculateTotal([])).toThrow('Items invalides');
      expect(() => coverageUtils.calculateTotal('invalid')).toThrow('Items invalides');
    });
    
    it('DEVRAIT lever une erreur pour prix négatif', () => {
      const items = [{ price: -10, quantity: 1 }];
      expect(() => coverageUtils.calculateTotal(items)).toThrow('Prix négatif détecté');
    });
    
    it('DEVRAIT lever une erreur pour quantité invalide', () => {
      const items = [{ price: 10, quantity: 0 }];
      expect(() => coverageUtils.calculateTotal(items)).toThrow('Quantité invalide');
    });
    
    it('DEVRAIT lever une erreur pour pourcentage invalide', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { discountType: 'percentage', discountValue: -10 };
      expect(() => coverageUtils.calculateTotal(items, options)).toThrow('Pourcentage de réduction invalide');
    });
    
    it('DEVRAIT lever une erreur pour réduction fixe invalide', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { discountType: 'fixed', discountValue: -10 };
      expect(() => coverageUtils.calculateTotal(items, options)).toThrow('Réduction fixe invalide');
    });
    
    it('DEVRAIT lever une erreur pour taux de taxe invalide', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { taxRate: 1.5 };
      expect(() => coverageUtils.calculateTotal(items, options)).toThrow('Taux de taxe invalide');
    });
    
    it('DEVRAIT lever une erreur pour frais de livraison invalides', () => {
      const items = [{ price: 100, quantity: 1 }];
      const options = { shipping: -5 };
      expect(() => coverageUtils.calculateTotal(items, options)).toThrow('Frais de livraison invalides');
    });
  });
  
  describe('getArticleStatus', () => {
    it('DEVRAIT retourner "invalid" pour article invalide', () => {
      expect(coverageUtils.getArticleStatus(null)).toBe('invalid');
      expect(coverageUtils.getArticleStatus('invalid')).toBe('invalid');
    });
    
    it('DEVRAIT retourner "sold" pour article vendu', () => {
      const article = { isSold: true };
      expect(coverageUtils.getArticleStatus(article)).toBe('sold');
    });
    
    it('DEVRAIT retourner "bid_expired" pour enchère expirée', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const article = { bidEndDate: pastDate.toISOString() };
      expect(coverageUtils.getArticleStatus(article)).toBe('bid_expired');
    });
    
    it('DEVRAIT retourner "bid_active" pour enchère active', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const article = { bidEndDate: futureDate.toISOString() };
      expect(coverageUtils.getArticleStatus(article)).toBe('bid_active');
    });
    
    it('DEVRAIT retourner "has_offers" pour article avec offres', () => {
      const article = { hasOffers: true };
      expect(coverageUtils.getArticleStatus(article)).toBe('has_offers');
    });
    
    it('DEVRAIT retourner "available" pour article disponible', () => {
      const article = { quantity: 5 };
      expect(coverageUtils.getArticleStatus(article)).toBe('available');
    });
    
    it('DEVRAIT retourner "out_of_stock" pour article épuisé', () => {
      const article = { quantity: 0 };
      expect(coverageUtils.getArticleStatus(article)).toBe('out_of_stock');
    });
  });
  
  describe('formatDisplayText', () => {
    it('DEVRAIT retourner une chaîne vide pour null/undefined', () => {
      expect(coverageUtils.formatDisplayText(null)).toBe('');
      expect(coverageUtils.formatDisplayText(undefined)).toBe('');
    });
    
    it('DEVRAIT retourner "(vide)" pour chaîne vide', () => {
      expect(coverageUtils.formatDisplayText('')).toBe('(vide)');
      expect(coverageUtils.formatDisplayText('   ')).toBe('(vide)');
    });
    
    it('DEVRAIT retourner le texte tel quel si assez court', () => {
      const text = 'Hello World';
      expect(coverageUtils.formatDisplayText(text, 20)).toBe(text);
    });
    
    it('DEVRAIT tronquer le texte long', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(coverageUtils.formatDisplayText(text, 20)).toBe('This is a very lo...');
    });
  });
  
  describe('formatRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('DEVRAIT retourner "Dans le futur" pour date future', () => {
      const futureDate = '2024-01-16T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(futureDate)).toBe('Dans le futur');
    });
    
    it('DEVRAIT retourner "À l\'instant"', () => {
      const now = '2024-01-15T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(now)).toBe('À l\'instant');
    });
    
    it('DEVRAIT retourner "Il y a X minutes"', () => {
      const minutesAgo = '2024-01-15T11:45:00Z';
      expect(coverageUtils.formatRelativeDate(minutesAgo)).toBe('Il y a 15 minutes');
    });
    
    it('DEVRAIT retourner "Il y a X heures"', () => {
      const hoursAgo = '2024-01-15T09:00:00Z';
      expect(coverageUtils.formatRelativeDate(hoursAgo)).toBe('Il y a 3 heures');
    });
    
    it('DEVRAIT retourner "Hier"', () => {
      const yesterday = '2024-01-14T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(yesterday)).toBe('Hier');
    });
    
    it('DEVRAIT retourner "Il y a X jours"', () => {
      const daysAgo = '2024-01-12T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(daysAgo)).toBe('Il y a 3 jours');
    });
    
    it('DEVRAIT retourner "Il y a X semaines"', () => {
      const weeksAgo = '2024-01-01T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(weeksAgo)).toBe('Il y a 2 semaines');
    });
    
    it('DEVRAIT retourner "Il y a plus d\'un mois"', () => {
      const monthsAgo = '2023-11-15T12:00:00Z';
      expect(coverageUtils.formatRelativeDate(monthsAgo)).toBe('Il y a plus d\'un mois');
    });
  });
  
  describe('checkUserPermissions', () => {
    it('DEVRAIT refuser un utilisateur non connecté', () => {
      const result = coverageUtils.checkUserPermissions(null, ['read']);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Non connecté');
    });
    
    it('DEVRAIT refuser un utilisateur banni', () => {
      const user = { isBanned: true, role: 'user' };
      const result = coverageUtils.checkUserPermissions(user, ['read']);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Compte suspendu');
    });
    
    it('DEVRAIT autoriser un admin', () => {
      const user = { role: 'admin' };
      const result = coverageUtils.checkUserPermissions(user, ['read', 'write', 'delete']);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Admin');
    });
    
    it('DEVRAIT refuser pour permissions manquantes', () => {
      const user = { 
        role: 'user', 
        permissions: ['read', 'write'] 
      };
      const result = coverageUtils.checkUserPermissions(user, ['read', 'delete']);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permissions manquantes');
    });
    
    it('DEVRAIT autoriser avec toutes les permissions', () => {
      const user = { 
        role: 'user', 
        permissions: ['read', 'write', 'delete'] 
      };
      const result = coverageUtils.checkUserPermissions(user, ['read', 'write']);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Autorisé');
    });
  });
});