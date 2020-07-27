// type definitions for Cypress object "cy"
/// <reference types="Cypress" />
/// <reference types="cypress" />

context('Cypress', () => {
  describe('Sanity check', () => {
    it('2 + 2 = 4', () => {
      expect(2 + 2).to.equal(4)
    })
  })

  describe('Login', () => {
    beforeEach(() => {
      cy.setupPage()
    })
    it('successfully loads', () => {
      cy.visit('/')
    })

    it('Logs in with test user', () => {
      cy.clearCookies()
      cy.setCookie('jwt', '123-456-789')
      cy.visit('/')
      const cookies = cy.getCookies()
      cookies.should('have.length', 2)
      cookies.get('jwt').should('not.be.undefined')
      cookies.get('sails.sid').should('not.be.undefined')
      cy.url().should('equal', 'http://localhost:1337/app#!/labels')
    })
  })
})
