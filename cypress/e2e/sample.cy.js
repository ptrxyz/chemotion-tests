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

function getMinMaxLimits(arr){
    // This function returns lower-1 and upper+1 bound values of abbreviaton length defined in user_props.yml
    var minMaxLimits = [arr[0]-1, arr[1]+1]
    return minMaxLimits
}

const testuser = {
    mail: `${makeid(10)}@test.de`,
    abbr: `${makeid(3)}`,
    password: 'chemotion',
    cookie: {},
}

const testdevice = {
    mail: `${makeid(10)}@device.de`,
    abbr: `${makeid(6)}`,
    password: 'chemotion',
    cookie: {},
}

const personuser = {
    mail: `${makeid(10)}@eln.edu`,
    abbr: `${makeid(3)}`,
    password: 'chemotion',
    firstname: 'test',
    lastname: 'Complat User',
    cookie: {},
}

const adminuser = {
    abbr: 'ADM',
    password: 'PleaseChangeYourPassword',
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

describe('Base Tests', () => {
    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop()
        }
    })

    it('Visit Chemotion', () => {
        cy.clearCookie('_chemotion_session')
        cy.visit(Cypress.env('TARGET'))
        cy.contains('Welcome to Chemotion Electronic Lab Notebook.')
    })

    it('Admin Login', () => {
        cy.get('#user_login').type(adminuser.abbr)
        cy.get('#user_password').type(adminuser.password)
        cy.get('#new_user > button[type=submit]').click()
        cy.get('h1').should('have.text', 'ELN Administration')
    })

    // test device creation
    for (const elem of getMinMaxLimits(Cypress.env("lengthDevice"))){
        it('Create Device with lenght: ' + elem , () => {
            cy.get('#AdminHome > div > div > div.card-content.container-fluid.row')
                .contains('User Management')
                .click()
            cy.contains('New User').click()
            cy.get('input[name=email]').type(testuser.mail)
            cy.get('input[name=password]').type(testuser.password)
            cy.get('#formControlPasswordConfirmation').type(testuser.password)
            cy.get('input[name=firstname]').type('chemotion')
            cy.get('input[name=lastname]').type('chemotion')
            cy.get('input[name=nameAbbr]').type(`${makeid(elem)}`)
            cy.get('#formControlsType').get('select').select('Device')
            cy.get('button').contains('Create user').click()
            cy.get('#formControlMessage').should('have.value',"Validation failed: Name abbreviation has to be 2 to 6 characters long, Name abbreviation can be alphanumeric, middle '_' and '-' are allowed, but leading digit, or trailing '-' and '_' are not., Email from throwable email providers not accepted")
            cy.get('button.close').click()
        })
    }

    // Test dummy user creation with reserved list
    for (let i=0; i<Cypress.env("reservedList").length; i++){
        it('Create Dummy with ' + Cypress.env("reservedList")[i] +': reserved Keywords', () => {
            cy.get('#AdminHome > div > div > div.card-content.container-fluid.row')
                .contains('User Management')
                .click()
            cy.contains('New User').click()
            cy.get('input[name=email]').type(testuser.mail)
            cy.get('input[name=password]').type(testuser.password)
            cy.get('#formControlPasswordConfirmation').type(testuser.password)
            cy.get('input[name=firstname]').type('chemotion')
            cy.get('input[name=lastname]').type('chemotion')
            cy.get('input[name=nameAbbr]').type(Cypress.env("reservedList")[i])
            cy.get('button').contains('Create user').click()
            cy.get('#formControlMessage').should('have.value', 'Validation failed: Name abbreviation is reserved, please change, Email from throwable email providers not accepted')
            cy.get('button.close').click()
        })
    }

    // test dummy user creation within defined length of abbreviation
    for (const elem of getMinMaxLimits(Cypress.env("lengthDefault"))){
        it('Create Dummy with length: ' + elem , () => {
            cy.get('#AdminHome > div > div > div.card-content.container-fluid.row')
                .contains('User Management')
                .click()
            cy.contains('New User').click()
            cy.get('input[name=email]').type(testuser.mail)
            cy.get('input[name=password]').type(testuser.password)
            cy.get('#formControlPasswordConfirmation').type(testuser.password)
            cy.get('input[name=firstname]').type('chemotion')
            cy.get('input[name=lastname]').type('chemotion')
            cy.get('input[name=nameAbbr]').type(`${makeid(elem)}`)
            cy.get('button').contains('Create user').click()
            cy.get('#formControlMessage').should('have.value',"Validation failed: Name abbreviation has to be 2 to 3 characters long, Name abbreviation can be alphanumeric, middle '_' and '-' are allowed, but leading digit, or trailing '-' and '_' are not., Email from throwable email providers not accepted")
            cy.get('button.close').click()
        })
    }

    // Test dummy user creation with valid parameters
    it('Create Dummy User', () => {
        cy.get('#AdminHome > div > div > div.card-content.container-fluid.row')
            .contains('User Management')
            .click()
        cy.contains('New User').click()
        cy.get('input[name=email]').type(personuser.mail)
        cy.get('input[name=password]').type(personuser.password)
        cy.get('#formControlPasswordConfirmation').type(personuser.password)
        cy.get('input[name=firstname]').type(personuser.firstname)
        cy.get('input[name=lastname]').type(personuser.lastname)
        cy.get('input[name=nameAbbr]').type(personuser.abbr)
        cy.get('button').contains('Create user').click()
        cy.get('#formControlMessage').should('have.value', 'New user created.')
        cy.get('button.close').click()
        cy.get('table').contains(personuser.mail.toLowerCase())
    })

    it('Logout', () => {
        cy.get('a[title="Log out"]').click()
    })
})

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
        it('Create Collection', () => {
            cy.intercept('GET', '/api/v1/collections/roots.json').as(
                'colletions1'
            )
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
            cy.get('input[type=text][value="New Collection"]').clear()
            cy.get('.node > input[type=text][value=""]')
                .click()
                .type('Pedro Collection')
            cy.get('#my-collections-update-btn').click()
            cy.wait('@collections.patch')
                .its('response.statusCode')
                .should('be.equal', 200)
            cy.request('/api/v1/collections/roots.json').should((response) => {
                expect(response).property('status').to.equal(200)
                expect(response.body).to.have.property('collections')
                const collectionCount = response.body.collections.length
                expect(
                    response.body.collections[collectionCount - 1].label
                ).to.equal('Pedro Collection')
            })
        })

    it('Import Data', () => {
        cy.intercept('POST', '/api/v1/collections/imports/').as(
            'doImportRequest'
        )

        cy.get('#export-dropdown').click()
        cy.get('a[role="menuitem"]').contains('Import collections').click()
        cy.get('input[type="file"]').attachFile('demo.zip')
        cy.get('div[role="toolbar"] button').contains('Import').click()
        cy.wait('@doImportRequest')

        function req() {
            cy.wait(5000)
            cy.request(`/api/v1/collections/roots.json`).then((response) => {
                cy.log(response)
                expect(response.status).to.equal(200)
                expect(response.body).to.have.property('collections')

                const collectionCount = response.body.collections.length
                cy.log(response.body.collections, collectionCount)
                if (collectionCount > 0) {
                    const latestEntry =
                        response.body.collections[collectionCount - 1]
                    expect(latestEntry).to.have.property('label')
                    if (latestEntry.label == 'My Data') {
                        console.log('All good')
                        return
                    }
                }
                req()
            })
        }

        req()

        cy.log('done.')
    })

    it('Export Collection', () => {
        // export a collection
        cy.getCookie('_chemotion_session')
            .should('exist')
            .then((c) => {
                console.log(c)
                adminuser.cookie = c
            })

        cy.wait(2000)
        cy.get('#export-dropdown').click()
        cy.get('a[role="menuitem"]').contains('Export collections').click()
        cy.get('#export-collection-check-all').click()
        cy.get('#md-export-dropdown').click()
        cy.log('done.')
    })

    it('Remain logout while back browsing', () => {

        // after logout browse back and access homepage to see if it logs out correctly
        cy.get('a[title="Log out"]', { timeout: 10000 }).should('be.visible')
        cy.get('a[title="Log out"]').click({force: true})
        cy.go('back')
        cy.visit(Cypress.env('TARGET'))
        cy.contains('Welcome to Chemotion Electronic Lab Notebook.')

        cy.log("Log out successfuly ")
    })
})