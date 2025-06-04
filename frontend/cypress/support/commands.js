Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get('input[placeholder="Nazwa użytkownika"]')
    .filter(":visible")
    .first()
    .type(username);
  cy.get('input[placeholder="Hasło"], input[placeholder="Password"]')
    .filter(":visible")
    .first()
    .type(password);
  cy.get('[data-testid="login-btn"]')
    .filter(":visible")
    .first()
    .click({ force: true });
});
