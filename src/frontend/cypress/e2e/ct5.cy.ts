describe('CT5 - Consulta histórico', ()=>{

    it('deve pesquisar uma tentativa e exibir ela corretamente sem perda de informações', () => {
        cy.visit('http://localhost:5173/historico')

        // cy.get('table tbody tr').should('have.lenght.greaterThan', 0)
        cy.get('table tbody tr').first().click()

        cy.contains('Status do Percurso').should('be.visible');
        cy.contains('Tempo de Tentativa').should('be.visible');
        cy.contains('Distância Percorrida').should('be.visible');
        cy.contains('Velocidade Atual').should('be.visible');
        cy.contains('Corrente Atual').should('be.visible');
        cy.contains('Voltagem Atual').should('be.visible');
        cy.contains('0.0S').should('not.exist');
        cy.contains('0.00 M').should('not.exist');
        cy.contains('0.00 M/S').should('not.exist');
        cy.contains('0 MA').should('not.exist');
        cy.contains('0.0 v').should('not.exist');
    });

    it('deve exibir os graficos', () => {
        cy.visit('http://localhost:5173/historico')
        cy.get('table tbody tr').first().click()
        cy.contains('VELOCIDADE DURANTE O TESTE').should('be.visible');
        cy.contains('EVOLUÇÃO DA DISTÂNCIA').should('be.visible');
        cy.contains('VOLTAGEM DA BATERIA').should('be.visible');
        cy.contains('AMPERAGEM DA BATERIA').should('be.visible');
    })

});