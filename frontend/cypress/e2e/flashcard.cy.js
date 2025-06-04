import "../support/commands";

describe("Tworzenie folderu z fiszkami", () => {
  it("loguje się i tworzy folder z 2 fiszkami", () => {
    cy.fixture("user").then(({ username, password }) => {
      cy.login(username, password);
      cy.url().should("include", "/translation");

      cy.visit("/flashcard/create-folder");
      cy.url().should("include", "/flashcard/create-folder");

      // Nazwa folderu
      const folderName = `Folder ${Date.now()}`;
      cy.get('[data-testid="flashcard-folder-name-input"]').type(folderName);

      // Fiszka 1
      const front1 = `Front ${Math.random().toString(36).substring(2, 8)}`;
      const back1 = `Back ${Math.random().toString(36).substring(2, 8)}`;
      cy.get('[data-testid="flashcard-front-content-0"]').type(front1);
      cy.get('[data-testid="flashcard-back-content-0"]').type(back1);

      // Dodaj drugą fiszkę
      cy.get('[data-testid="add-flashcard-button"]').click({ force: true });

      // Fiszka 2
      const front2 = `Front ${Math.random().toString(36).substring(2, 8)}`;
      const back2 = `Back ${Math.random().toString(36).substring(2, 8)}`;
      cy.get('[data-testid="flashcard-front-content-1"]').type(front2);
      cy.get('[data-testid="flashcard-back-content-1"]').type(back2);

      // Utwórz folder
      cy.get('[data-testid="create-folder-button"]').click({ force: true });

      // Sprawdź, czy folder pojawił się na liście (po przekierowaniu)
      cy.url().should("include", "/flashcard");
      cy.contains(folderName).should("exist");
    });
  });
});
