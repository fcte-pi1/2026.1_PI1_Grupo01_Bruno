describe('CT3', () => {


    beforeEach(() => {

        cy.visit('http://127.0.0.1:5173/percurso');
        
        // cy.contains('Em execução', { timeout: 1000 }).should('be.visible');

    })

    it('deve exibir mensagem de sucesso ao alcançar o objetivo', () => {
        cy.contains(/INICIAR/i).click({ force: true });
        cy.contains('Objetivo alcançado!', { timeout: 30000 }).should('be.visible');
        cy.contains('Sucesso').should('be.visible');
        
    });

    it('deve manter as médias ao finalizar o percurso', () => {
        cy.contains(/INICIAR/i).click({ force: true });
        cy.wait(30000);
        cy.contains('VELOCIDADE DURANTE O TESTE').parent().should('contain', 'm/s');
        cy.contains('EVOLUÇÃO DA DISTÂNCIA').parent().should('contain', 'm');
        cy.contains('VOLTAGEM DA BATERIA').parent().should('contain', 'V');
        cy.contains('AMPERAGEM DA BATERIA').parent().should('contain', 'mA');
    });

    
    
});