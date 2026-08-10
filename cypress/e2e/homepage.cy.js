describe('Sleekblue website main flow', () => {
  it('loads the homepage and opens the mobile menu without admin link', () => {
    cy.visit('/')
    cy.viewport('iphone-6')
    cy.get('[aria-label="Open menu"]').click()
    cy.contains('Admin').should('not.exist')
    cy.contains('Store').should('be.visible')
    cy.contains('Blog').should('be.visible')
  })
})
