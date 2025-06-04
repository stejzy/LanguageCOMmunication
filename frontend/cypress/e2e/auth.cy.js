describe("auth redirect", () => {
  it("redirects to login page if unauthenticated", () => {
    cy.visit("http://localhost:8081", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });

    cy.url().should("include", "/login");

    cy.get("input").should("exist");

    const possiblePlaceholders = {
      username: ["Nazwa użytkownika", "Username"],
      password: ["Hasło", "Password"],
    };

    cy.get("input[placeholder]").then(($inputs) => {
      const placeholders = [...$inputs].map(
        (input) => input.getAttribute("placeholder") || ""
      );

      expect(
        placeholders.some((ph) => possiblePlaceholders.username.includes(ph))
      ).to.be.true;
      expect(
        placeholders.some((ph) => possiblePlaceholders.password.includes(ph))
      ).to.be.true;
    });
  });
});

it("rejestracja i automatyczna weryfikacja konta", () => {
  const uniqueEmail = `nowy_${Date.now()}@test.com`;
  const username = `nowyuzytkownik${Date.now()}`;
  const password = "MojeHaslo123!";

  cy.visit("http://localhost:8081");
  cy.contains(/Utwórz nowe konto|Create new account/i).click();

  cy.get(
    'input[placeholder="Nazwa użytkownika"], input[placeholder="Username"]'
  )
    .filter(":visible")
    .first()
    .type(username);
  cy.get('input[placeholder="Email"], input[placeholder="Adres e-mail"]')
    .filter(":visible")
    .first()
    .type(uniqueEmail);
  cy.get('input[placeholder="Hasło"], input[placeholder="Password"]')
    .filter(":visible")
    .first()
    .type(password);
  cy.get(
    'input[placeholder="Powtórz hasło"], input[placeholder="Confirm password"]'
  )
    .filter(":visible")
    .first()
    .type(password);

  cy.get('[data-testid="register-btn"]').click({ force: true });

  cy.url().should("include", "/register/verify");

  // Pobierz kod weryfikacyjny z backendu
  cy.request(
    `${Cypress.env(
      "apiUrl"
    )}/api/test/last-verification-code?email=${uniqueEmail}`
  ).then((resp) => {
    const code = resp.body.code;
    expect(code).to.have.length(6);

    // Upewnij się, że inputów jest 6 i wpisz kod tylko w nie
    cy.get('[data-testid="verify-inputs"]').within(() => {
      cy.get("input")
        .should("have.length", 6)
        .each(($input, idx) => {
          cy.wrap($input).type(code[idx]);
        });
    });

    // Sprawdź przekierowanie po weryfikacji (np. na login)
    cy.url().should("include", "/login");

    // Zapamiętaj dane użytkownika do użycia w innych testach
    cy.writeFile("cypress/fixtures/user.json", {
      username,
      password,
      email: uniqueEmail,
    });

    // Logowanie tymi samymi danymi (przykład użycia cy.login)
    cy.login(username, password);
    cy.url().should("include", "/translation");
  });
});
