// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('setupPage', () => {
  Cypress.Cookies.debug()
  cy.viewport(1440, 960)
  cy.server()
  cy.setupFixtures()
  cy.setupRoutes()
})

Cypress.Commands.add('setupFixtures', () => {
  cy.fixture('authentication.json').as('authenticationJSON')
  cy.fixture('labels-small.json').as('labelsJSON')
  cy.fixture('labels.json').as('allLabelsJSON')
})

Cypress.Commands.add('setupRoutes', () => {
  cy.route('POST', '/api/auth/authenticate', '@authenticationJSON').as('auth-user')
  cy.route('GET', '/api/gmail/labels', '@labelsJSON').as('labels-list')
})

Cypress.Commands.add('setAuthenticatedUser', () => {
  cy.fixture('authentication.json')
    .as('authentication')
    .then((auth) => {
      cy.setCookie('jwt', auth.token)
      cy.getCookies().get('jwt').should('not.be.undefined')
    })
})
