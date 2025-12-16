describe("Login E2E", () => {
  it("connexion utilisateur valide et ajouter un soulier", () => {
    // VISIT LOGIN
    cy.visit("/login");
    cy.location("pathname").should("eq", "/login");

    // INTERCEPT LOGIN
    cy.intercept("POST", "/api/login").as("login");

    // ACTION LOGIN
    cy.getByTest("email").type("123@gmail.com");
    cy.getByTest("password").type("123");
    cy.getByTest("login-submit").click();

    // WAIT LOGIN RESPONSE
    cy.wait("@login").its("response.statusCode").should("eq", 200);

    // ASSERT PROFILE PAGE
    cy.location("pathname").should("eq", "/profile");
    cy.contains("Déconnexion").should("be.visible");
    cy.contains("Mes Articles").should("be.visible");
    cy.contains("Mes Favoris").should("be.visible");

    // NAVIGATE TO ADD SHOE PAGE
    cy.visit("/");
    cy.getByTest("add-shoe-button").click();

    // FILL ADD SHOE FORM
    cy.getByTest("shoe-name").type("Test Shoe");
    cy.getByTest("shoe-description").type("Description du soulier");
    cy.getByTest("shoe-price").type("599");
    cy.getByTest("shoe-condition").select("Neuf");
    cy.getByTest("submit-shoe").click();

    // ✅ ASSERTION: shoe is added in the list
    // On attend que le POST ait été envoyé et que le nouveau shoe apparaisse
    cy.contains("Test Shoe").should("be.visible");
    cy.contains("599").should("be.visible");
    cy.contains("Neuf").should("be.visible");
    cy.contains("Description du soulier").should("be.visible");
  });
});
