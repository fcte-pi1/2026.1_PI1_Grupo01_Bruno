describe('CT4 - Armazenamento de dados', () => {
    
    it('deve armazenar uma tentativa sem erros', () => {

        cy.intercept('GET', '**/corridas*').as('getCorridas');

        cy.visit('http://localhost:5173/historico');
        cy.wait('@getCorridas', { timeout: 15000 });
        cy.get('table tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);

        cy.get('table tbody tr').first().invoke('text').then((textoLinhaAntes) => {
            const idAntes = textoLinhaAntes.trim();
            
            
            cy.contains(/novo percurso/i).click({ force: true });
    
            cy.contains(/INICIAR/i, { timeout: 10000 }).click({ force: true });
            cy.wait(10000); 
            cy.contains(/CANCELAR/i).click({ force: true });
            cy.contains(/histórico/i).click({ force: true });
            cy.wait('@getCorridas', { timeout: 15000 });
            cy.get('table tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
            cy.get('table tbody tr').first().invoke('text').then((textoLinhaDepois) => {
                const idDepois = textoLinhaDepois.trim();
                expect(idAntes).to.not.equal(idDepois);
            });
        });
    });
});