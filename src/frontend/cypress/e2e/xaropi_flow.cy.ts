describe('Fluxo do Sistema XAROPI', () => {
    
    it('Deve carregar o Dashboard', () => {
        cy.visit('http://localhost:5173/');
        cy.contains(/Histórico/i).should('be.visible');
        cy.get('table').should('exist');
    });

    it('Deve iniciar um percurso e responder aos comandos', () => {
        cy.visit('http://localhost:5173/percurso');
        
    
        cy.contains(/INICIAR/i).should('be.visible').click({ force: true });
        
        
        cy.contains(/EM EXECUÇÃO/i, { timeout: 10000 }).should('be.visible');
        
        cy.contains(/Rato na célula/i, { timeout: 25000 }).should('exist');
    });

    it('Deve navegar do Percurso de volta ao Dashboard', () => {
        cy.visit('http://localhost:5173/percurso');
        
      
        cy.contains(/DASHBOARD/i).click();
        
        
        cy.url().should('eq', 'http://localhost:5173/');
    });

    it('Deve exibir o status de conectado', () => {
        cy.visit('http://localhost:5173/');
        
        
        cy.contains(/CONECTADO/i, { timeout: 15000 }).should('be.visible');
    });
});