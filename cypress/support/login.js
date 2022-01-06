Cypress.Commands.add('loginSettings', (email, password) => {
  cy.visit('/');
  cy.fixture('login.json').then((loginLocators) => {
    cy.get(loginLocators.inputEmail).type(email);
    cy.get(loginLocators.inputPassword).type(password, { log: false });
    cy.contains('Log in').click();
  });
  cy.fixture('users.json').then((usersLocators) => {
    cy.get(usersLocators.inputFilterUserName).should('be.visible');
  });
});
