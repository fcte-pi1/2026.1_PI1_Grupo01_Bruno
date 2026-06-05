describe('Dashboard de Percurso', () => {
  it('deve carregar a página e clicar no botão de iniciar', () => {
    // Trocamos localhost por 127.0.0.1 para forçar o IPv4
    cy.visit('http://127.0.0.1:5173/percurso');

    // Verifica se a página carregou um elemento com o texto "Percurso"
    cy.contains('h3', 'Percurso').should('be.visible');

    // Busca o botão "Iniciar" e clica nele
    cy.contains('button', /iniciar/i).click();
  });
});