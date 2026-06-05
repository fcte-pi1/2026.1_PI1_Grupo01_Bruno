describe('Fluxo Principal do Xaropi', () => {
    it('deve navegar do Dashboard para o Percurso e iniciar uma corrida', () => {
        // Acessa o Dashboard
        cy.visit('http://localhost:5173/');
        
        // Verifica se a tabela carregou
        cy.contains('Histórico de testes').should('be.visible');
        
        // Clica em Novo Percurso
        cy.contains('NOVO PERCURSO').click();
        
        // Verifica se navegou para a página de Percurso
        cy.url().should('include', '/percurso');
        
        // Clica em Iniciar e verifica se o status muda
        cy.contains('INICIAR', { matchCase: false, timeout: 10000 }).should('be.visible').click();
        
        //  Verifica se o log começou a aparecer
        cy.contains('Rato na célula').should('be.visible');
    });
});