describe("Login E2E", () => {
  it("connexion utilisateur valide puis déconnexion", () => {
    // Visit
    cy.visit("/login");
    cy.location("pathname").should("eq", "/login");

    // Intercept AVANT action
    cy.intercept("POST", "/api/login").as("login");

    // Action utilisateur
    cy.getByTest("email").type("123@gmail.com");
    cy.getByTest("password").type("123");
    cy.getByTest("login-submit").click();

    // Sync réseau
    cy.wait("@login").its("response.statusCode").should("eq", 200);

    // Assertions finales
    cy.location("pathname").should("eq", "/profile");
    cy.contains("Déconnexion").should("be.visible");
    cy.contains("Mes Articles").should("be.visible");
    cy.contains("Mes Favoris").should("be.visible");

    cy.wait(2000);

    // --- CLICK LOGOUT ---
    cy.contains("Déconnexion").click();

    // Verify redirect to login page
    cy.location("pathname").should("eq", "/login");
    cy.contains("Connexion").should("be.visible");
  });
});
