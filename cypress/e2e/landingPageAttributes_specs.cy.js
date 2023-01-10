describe('testing landing page', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('landing_page_url'))
        cy.contains('h3', 'Welcome to Chemotion Electronic Lab Notebook.')
    })

    it('link to Chemotion repository', () => {
        cy.contains('Chemotion repository').should('have.attr', 'href', 'http://www.chemotion.net'
        )
    })

    it('link to Complat', () => {
        cy.contains('Complat').should('have.attr', 'href', 'http://www.complat.kit.edu/')
    })

    it('link to Complat on GitHub', () => {
        cy.contains('Complat on Github').should('have.attr', 'href', 'https://github.com/ComPlat')
    })

    it('link to ELN', () => {
        cy.contains('ELN').should('have.attr', 'href', '/')
    })

    it('Link to About', () => {
        cy.contains('About').should('have.attr', 'href', '/about')
    })
})
