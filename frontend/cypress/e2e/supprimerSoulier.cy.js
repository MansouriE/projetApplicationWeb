describe("Login E2E", () => {
  it("connexion utilisateur valide et supprimer un soulier", () => {
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

    // --- DELETE SHOE ---
    const shoeName = "Test Shoe";

    // Find the article by name and click its delete button
    cy.getByTest("delete-Test-Shoe").click();

    // Confirm browser confirm dialog
    cy.on("window:confirm", () => true);

    // Assert the article no longer exists
    cy.contains(shoeName).should("not.exist");
  });
});
