Cypress.Commands.add("getByTest", (id) => {
  cy.get(`[data-test=${id}]`);
});

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.getByTest("email").type(email);
  cy.getByTest("password").type(`${password}{enter}`);
});

Cypress.Commands.add("getByTest", (id) => {
  return cy.get(`[data-test="${id}"]`);
});
