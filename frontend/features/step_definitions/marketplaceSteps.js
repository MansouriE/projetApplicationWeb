import assert from 'assert';
import { Before, Given, When, Then } from '@cucumber/cucumber';
import { jwtUtils } from '../../src/utils/jwtUtils.js';

Before(function () {
  this.context = {};
});

Given("un utilisateur avec l'id {int} et l'email {string}", function (id, email) {
  this.context.payload = { userId: id, email };
});

When('je genere un token JWT', function () {
  this.context.token = jwtUtils.signToken(this.context.payload);
});

Then("je recupere un payload contenant l'id {int} et l'email {string}", function (expectedId, expectedEmail) {
  const decoded = jwtUtils.verifyToken(this.context.token);
  assert.strictEqual(decoded.userId, expectedId);
  assert.strictEqual(decoded.email, expectedEmail);
});

Given('un token JWT invalide {string}', function (token) {
  this.context.invalidToken = token;
});

When('je tente de verifier le token JWT', function () {
  try {
    jwtUtils.verifyToken(this.context.invalidToken);
  } catch (error) {
    this.context.error = error;
  }
});

Then('une erreur {string} est levee', function (message) {
  assert.ok(this.context.error, 'Une erreur etait attendue');
  assert.strictEqual(this.context.error.message, message);
});

Given('un panier avec un sous-total de {int} et une remise de {int} pourcent', function (subtotal, discountPercent) {
  this.context.subtotal = subtotal;
  this.context.discountPercent = discountPercent;
});

When('je calcule le total TTC avec une taxe de {float}', function (taxRate) {
  const afterDiscount = jwtUtils.calculateDiscount(this.context.subtotal, this.context.discountPercent);
  const totalWithTax = jwtUtils.calculateTotalWithTax(afterDiscount, taxRate);
  this.context.totalWithTax = totalWithTax;
  this.context.formatted = jwtUtils.formatPrice(totalWithTax);
});

Then('le total TTC formate est {string}', function (formattedPrice) {
  assert.strictEqual(this.context.formatted, formattedPrice);
});

Then('le montant final numerique est {float}', function (finalAmount) {
  assert.strictEqual(this.context.totalWithTax, finalAmount);
});
