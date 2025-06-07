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

// Global delay after selected Cypress commands for debugging
const COMMANDS_TO_DELAY = [
  "click",
  "type",
  "clear",
  "check",
  "uncheck",
  "select",
  "trigger",
  "dblclick",
  "rightclick",
  "focus",
  "blur",
];

COMMANDS_TO_DELAY.forEach((command) => {
  Cypress.Commands.overwrite(command, (originalFn, ...args) => {
    return originalFn(...args).then((result) => {
      return Cypress.Promise.delay(50).then(() => result);
    });
  });
});
