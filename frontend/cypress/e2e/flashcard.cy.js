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

describe("Operacje na folderze fiszek", () => {
  let folderName;
  let front1, back1, front2, back2;

  before(() => {
    cy.fixture("user").then(({ username, password }) => {
      cy.login(username, password);
      cy.url().should("include", "/translation");
    });

    cy.window().then((win) => {
      console.log("Token:", win.localStorage.getItem("jwt_refresh_token"));
    });
    cy.visit("/flashcard/create-folder");
    folderName = `FolderTest_${Date.now()}`;
    front1 = `Front_${Math.random().toString(36).substring(2, 8)}`;
    back1 = `Back_${Math.random().toString(36).substring(2, 8)}`;
    front2 = `Front_${Math.random().toString(36).substring(2, 8)}`;
    back2 = `Back_${Math.random().toString(36).substring(2, 8)}`;
    cy.get('[data-testid="flashcard-folder-name-input"]').type(folderName);
    cy.get('[data-testid="flashcard-front-content-0"]').type(front1);
    cy.get('[data-testid="flashcard-back-content-0"]').type(back1);
    cy.get('[data-testid="add-flashcard-button"]').click({ force: true });
    cy.get('[data-testid="flashcard-front-content-1"]').type(front2);
    cy.get('[data-testid="flashcard-back-content-1"]').type(back2);
    cy.get('[data-testid="create-folder-button"]').click({ force: true });
    cy.url().should("include", "/flashcard");
    cy.contains(folderName).should("exist").click();
    cy.url().should("include", "/flashcard/");
  });

  it("dodaje nową fiszkę do folderu", () => {
    cy.get('[data-testid="add-flashcard-button"]').click({ force: true });
    const newFront = `Front_${Math.random().toString(36).substring(2, 8)}`;
    const newBack = `Back_${Math.random().toString(36).substring(2, 8)}`;
    cy.get('[data-testid="flashcard-front-content-input"]').type(newFront);
    cy.get('[data-testid="flashcard-back-content-input"]').type(newBack);
    cy.contains(/Zapisz|Save/).click({ force: true });
    cy.contains(newFront).should("exist");
    cy.contains(newBack).should("exist");
    cy.url().then((url) => cy.log("Aktualny URL:", url));
  });

  it("usuwa fiszkę z folderu", () => {
    cy.get(
      '[aria-label="Usuń fiszkę"], [aria-label="Delete flashcard"], [data-testid*="delete"]'
    )
      .first()
      .click({ force: true });
    cy.contains(front1).should("not.exist");
  });

  it("edytuje fiszkę w folderze", () => {
    cy.get(
      '[aria-label="Edytuj fiszkę"], [aria-label="Edit flashcard"], [data-testid*="edit"]'
    )
      .first()
      .click({ force: true });
    const updatedFront = `Edytowany_${front1}`;
    cy.get("input[placeholder]").first().clear().type(updatedFront);
    cy.contains(/Zapisz|Save/).click({ force: true });
    cy.contains(updatedFront).should("exist");
  });

  it("przechodzi test fiszek w folderze", () => {
    cy.contains(/Ćwicz fiszki|Practice flashcards/).click({ force: true });
    cy.url().should("include", "/test");
    cy.get('[data-testid="correct-button"]').click({ force: true });
    cy.get('[data-testid="wrong-button"]').click({ force: true });
    cy.contains(/Wynik testu|Result/).should("exist");
    cy.contains(/Powrót do folderu|Return/).click({ force: true });
    cy.url().should("include", "/flashcard/");
  });

  it("eksportuje i importuje folder fiszek", () => {
    cy.get('[data-testid="export-folder-modal"]')
      .first()
      .click({ force: true });

    cy.get('[data-testid="export-folder-code"]')
      .invoke("text")
      .then((exportCode) => {
        cy.visit("/flashcard");
        cy.get('[data-testid="import-folder-button"]').click({ force: true });
        cy.get('[data-testid="import-folder-input"]').type(exportCode);
        cy.get('[data-testid="folder-import-button"]').click({
          force: true,
        });
        cy.contains(folderName).should("exist");
      });
  });

  it("usuwa folder fiszek", () => {
    cy.visit("/flashcard");
    cy.get('[data-testid="flashcard-folder"]').then(($foldersBefore) => {
      const countBefore = $foldersBefore.length;

      cy.contains(folderName).first().parent().trigger("contextmenu");
      cy.contains(/Usuń folder|Delete Folder/).click({ force: true });

      cy.get('[data-testid="flashcard-folder"]').should(
        "have.length",
        countBefore - 1
      );
    });
  });
});
