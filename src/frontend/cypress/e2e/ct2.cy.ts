describe('CT2', () => {


    beforeEach(() => {

        cy.visit('http://127.0.0.1:5173/percurso');

    })

    it('deve navegar do Dashboard para o Percurso e iniciar uma corrida', () => {
        
        cy.contains('INICIAR', { matchCase: false, timeout: 10000 }).should('be.visible').click();
        cy.contains('Em execução').should('be.visible');
        cy.contains('Exploração iniciada').should('be.visible');
    });

    it('deve reiniciar a corrida', () => {
        cy.contains(/INICIAR/i).click({ force: true });
        cy.contains('Em execução', { timeout: 10000 }).should('be.visible');
        cy.contains(/REINICIAR/i).click({ force: true });
        cy.contains('Deseja reiniciar o percurso?').should('be.visible');
        cy.contains('button', /REINICIAR/i).click();
        cy.contains('Aguardando...', { timeout: 5000 }).should('be.visible');
        cy.contains('0.0s').should('be.visible');
    })

    
});