// Utilitaires JWT/formatage centralisés pour réutilisation (tests unitaires + BDD)
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (input) => Buffer.from(input, 'binary').toString('base64');
}

if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (input) => Buffer.from(input, 'base64').toString('binary');
}

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
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
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
      throw new Error('Pourcentage de reduction invalide');
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
