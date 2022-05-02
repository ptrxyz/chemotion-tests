function makeid(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

const testuser = {
    mail: `${makeid(10)}@test.de`,
    abbr: `${makeid(6)}`,
    password: 'chemotion',
    cookie: {},
}

const adminuser = {
    abbr: 'ADM',
    password: 'PleaseChangeYourPassword',
    cookie: {},
}

// To turn off all uncaught exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

Cypress.Cookies.defaults({
    preserve: '_chemotion_session',
})

describe('Base Tests', () => {
    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop()
        }
    })

    it('Visit Chemotion', () => {
        cy.clearCookie('_chemotion_session')
        cy.visit('https://seat1.chemotion.scc.kit.edu/')
        cy.get('#welcomeMessage').should(
            'contain.text',
            'Your Chemotion instance is ready!'
        )
    })

    it('Admin Login', () => {
        cy.get('#user_login').type(adminuser.abbr)
        cy.get('#user_password').type(adminuser.password)
        cy.get('#new_user > button[type=submit]').click()
        cy.get('h1').should('have.text', 'ELN Administration')
    })

    it('Create Dummy User', () => {
        cy.get('#AdminHome > div > div > div.card-content.container-fluid.row')
            .contains('User Management')
            .click()
        cy.contains('New User').click()
        cy.get('input[name=email]').type(testuser.mail)
        cy.get('input[name=password]').type(testuser.password)
        cy.get('#formControlPasswordConfirmation').type(testuser.password)
        cy.get('input[name=firstname]').type('chemotion')
        cy.get('input[name=lastname]').type('chemotion')
        cy.get('input[name=nameAbbr]').type(testuser.abbr)
        cy.get('button').contains('Create user').click()
        cy.get('#formControlMessage').should('have.value', 'New user created.')
        cy.get('button.close').click()
        cy.get('table').contains(testuser.mail.toLowerCase())
    })

    it('Logout', () => {
        cy.get('a[title="Log out"]').click()
    })
})

describe('User Test', () => {
    it('Visit Chemotion', () => {
        cy.clearCookie('_chemotion_session')
        cy.visit('https://seat1.chemotion.scc.kit.edu/')
        cy.get('#welcomeMessage').should(
            'contain.text',
            'Your Chemotion instance is ready!'
        )
    })

    it('Login as dummy user', () => {
        cy.get('#user_login').type(testuser.abbr)
        cy.get('#user_password').type(testuser.password)
        cy.get('#new_user > button[type=submit]').click()
        cy.get('div.title').should('contain.text', 'Collections')
    })
    if (true)
        it('Create Collection', () => {
            cy.intercept('GET', '/api/v1/collections/roots.json').as('colletions1')
            cy.intercept('GET', '/api/v1/collections/shared_roots.json').as(
                'colletions2'
            )
            cy.intercept('GET', '/api/v1/collections/remote_roots.json').as(
                'colletions3'
            )
            cy.intercept(
                'GET',
                '/api/v1/syncCollections/sync_remote_roots.json'
            ).as('colletions4')

            cy.intercept(
                {
                    url: '/api/v1/*ollections/*roots.json',
                    middleware: true,
                },
                (req) => {
                    req.on('response', (res) => {
                        // Throttle the response to 1 Mbps to simulate a
                        // mobile 3G connection
                        res.setThrottle(Math.floor(Math.random() * 10) + 10)
                        res.setDelay(Math.floor(Math.random() * 500) + 1500)
                    })
                }
            )

            cy.getCookie('_chemotion_session')
                .should('exist')
                .then((c) => {
                    console.log(c)
                    adminuser.cookie = c
                })
            const ro = { requestTimeout: 60000, responseTimeout: 90000 }

            cy.get('#col-mgnt-btn').click()
            cy.wait(
                ['@colletions1', '@colletions2', '@colletions3', '@colletions4'],
                ro
            )
            cy.wait(2000)
            cy.get('#mycol_-1').click()
            cy.get('input[type=text][value="New Collection"]').clear()
            cy.get('.node > input[type=text][value=""]')
                .click()
                .type('Pedro Collection')
            cy.wait(2000)
            cy.get('#my-collections-update-btn').click()
            cy.wait(['@colletions1', '@colletions2', '@colletions3'], ro)
            cy.get('.tree-wrapper .tree-view .title').contains('Pedro Collection')
        })
    
    it('Import Data', () => {
        cy.intercept('GET', '/api/v1/collections/roots.json').as('colletions1')
        cy.intercept('POST', '/api/v1/collections/imports/').as('doImportRequest')
        const timeoutOptions = { requestTimeout: 120000, responseTimeout: 240000 }

        cy.get('#export-dropdown').click()
        cy.get('a[role="menuitem"]').contains('Import collections').click()
        cy.get('input[type="file"]').attachFile('demo.zip')
        cy.get('div[role="toolbar"] button')
            .contains('Import')
            .click()
        cy.wait("@doImportRequest")
        cy.wait('@colletions1', timeoutOptions).then((request) => {
            expect(request.response).property('statusCode').to.equal(200)
            expect(request.response).property('body').to.have.property('collections')            
            const labels = Cypress._.map(request.response.body.collections, 'label')
            expect(labels).to.include("My Data")
        })
    })
})
