// isso aqui deve ficar pra depois do pc2

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

    it('Deve apagar uma corrida do histórico', () => {
        cy.visit('http://localhost:5173/');
        cy.get('table').should('exist');
        
        cy.get('table tbody tr').then(($linhas) => {
            if ($linhas.length > 0) {
                
                cy.intercept('DELETE', '**/corridas/**').as('deleteCorrida');

                
                cy.get('table tbody tr').first().find('button').first().click();

               
                cy.wait(500);

                
                cy.contains('button', /EXCLUIR/i).should('be.visible').click();

                
                cy.wait('@deleteCorrida', { timeout: 10000 })
                  .its('response.statusCode')
                  .should('be.oneOf', [200, 204]); 
            }
        });
    });
});