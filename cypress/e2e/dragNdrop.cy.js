const personuser = {
    mail: 'sbrcxrintr@eln.edu',
    abbr: 'QdZ',
    password: 'chemotion',
    firstname: 'test',
    lastname: 'Complat User',
    cookie: {},
}

const adminuser = {
    abbr: 'ADM',
    password: 'chemotion',
    cookie: {},
}

const globals = { polling: false }

// To turn off all uncaught exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

Cypress.Cookies.defaults({
    preserve: '_chemotion_session',
})

let sampleList = ['CC(O)C','CC(=O)C', 'CC(CC)C', 'CC(C)CC(=O)','c1c(N(=O)=O)cccc1','CC(C)(C)CC']

describe('User Test', () => {
    it('Visit Chemotion', () => {
        cy.clearCookie('_chemotion_session')
        cy.visit(Cypress.env('TARGET'))
        cy.contains('Welcome to Chemotion Electronic Lab Notebook.')
    })

    it('Login as dummy user', () => {
        cy.get('#user_login').type(personuser.abbr)
        cy.get('#user_password').type(personuser.password)
        cy.get('#new_user > button[type=submit]').click()
        cy.get('div.title').should('contain.text', 'Collections')
    })

    if (true)
        it('test dragNDrop and insert samples in sub Collection', () => {
            cy.intercept('GET', '/api/v1/collections/roots.json').as('colletions1')
            cy.intercept('GET', '/api/v1/collections/shared_roots.json').as('colletions2')
            cy.intercept('GET', '/api/v1/collections/remote_roots.json').as('colletions3')
            cy.intercept('GET', '/api/v1/syncCollections/sync_remote_roots.json').as('colletions4')
            cy.intercept('PATCH', '/api/v1/collections').as('collections.patch')

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
                [
                    '@colletions1',
                    '@colletions2',
                    '@colletions3',
                    '@colletions4',
                ],
                ro
            )

            cy.get('#mycol_-1').click()
            cy.get('input[type=text][value="New Collection"]').clear().type('test-collection')

            cy.get('#mycol_-1').click()
            cy.get('input[type=text][value="New Collection"]').clear().type('sub-collection')


            cy.get('#my-collections-update-btn').click()
            cy.wait('@collections.patch')
                .its('response.statusCode')
                .should('be.equal', 200)

            cy.get('#collection-management-tab-pane-0 > div > div > div > div.children > div:nth-child(4)')
            .trigger("mousedown", "center", { button: 0 }, { force: true })
            .trigger("mousemove", 535, 20)
            cy.get('#collection-management-tab-pane-0 > div > div > div > div.children > div:nth-child(3) > div.children')
            .trigger("mouseup", {force: true})
            cy.get('#my-collections-update-btn').click()

            cy.get('#tree-id-test-collection').invoke('attr', 'style', 'display: visible')
            cy.get('#tree-id-sub-collection').click()
            cy.wait(1000)

            cy.wait(1000)

            for (const elem of sampleList){
                cy.get('#app > div > div.card-navigation.row > nav > div > ul > div:nth-child(3) > div:nth-child(2) > div > div > button:nth-child(1) > div > i.fa.fa-plus').click()
                cy.wait(500)
                cy.get('#elements-tabs-pane-0 > div > div.panel-heading > div > div.fast-input.form-group.form-group-xs > span > div > button.fi-btn.btn.btn-xs.btn-default > span > input').type(elem)
                cy.get('#_fast_create_btn_split').click()
                cy.get('#elements-tabs-pane-0 > div > div.panel-heading > div > div.fast-input.form-group.form-group-xs > span > div > ul > li:nth-child(2) > a').click()
                cy.get('#elements-tabs-pane-0 > div > div.panel-heading > div > button:nth-child(3)').click()
            }
        })
})