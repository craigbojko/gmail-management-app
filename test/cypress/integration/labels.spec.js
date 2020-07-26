/**
 * Project: g-mail-management-app
 * FilePath: /test/cypress/integration/labels.spec.js
 * File: labels.spec.js
 * Created Date: Sunday, July 26th 2020, 9:10:01 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2020 Pixel Ventures Ltd.
 * ------------------------------------
 */

// type definitions for Cypress object "cy"
/// <reference types="Cypress" />
/// <reference types="cypress" />

context('Labels', () => {
  describe('UI Table', () => {
    beforeEach(() => {
      cy.setupPage()
    })
    it('successfully loads', () => {
      cy.visit('/app#!/labels')
    })

    it('Should display a list of labels after logging in', () => {
      cy.setAuthenticatedUser()
      cy.visit('/')
      cy.url().should('equal', 'http://localhost:1337/app#!/labels')

      cy.get('table .md-body').should('not.be.undefined')
      cy.get('table .md-body tr').should('have.length', 14)
    })
  })
})
