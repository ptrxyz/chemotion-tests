describe('greets with Sign in', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/users/sign_in')
    })

    it('greets with Sign in', () => {
        cy.contains('h2', 'Log in')
    })

    it('check input type', () => {
        cy.get('#user_login').should('have.attr', 'type', 'text')
    })

    it('check password type', () => {
        cy.get('#user_password').should('have.attr', 'type', 'password')
    })

    it('check Login button type', () => {
        cy.get('input').should('contain', 'Log in')
        .contains('Log in')
        .should('have.attr', 'type', 'submit')
    })

    it('link to sign up', () => {
        cy
        .contains('Sign up')
        .should('have.attr', 'href', '/users/sign_up')
    })

    it('link to Forgot your password', () => {
        cy
        .contains('Forgot your password?')
        .should('have.attr', 'href', '/users/password/new')
    })

    it('link to Did\'nt receive confirmation instructions?', () => {
        cy
        .contains("Didn't receive confirmation instructions?")
        .should('have.attr', 'href', '/users/confirmation/new')
    })
})
