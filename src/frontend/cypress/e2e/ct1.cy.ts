describe('ct1', () => {

  beforeEach(() => {

    cy.visit('http://127.0.0.1:5173/percurso');

  })

  it('deve exibir todos os cards de telemetria ao carregar a pagina', () => {
    cy.contains('Status do Percurso').should('be.visible');
    cy.contains('Tempo de Resolução').should('be.visible');
    cy.contains('Distância Percorrida').should('be.visible');
    cy.contains('Velocidade Atual').should('be.visible');
    cy.contains('Corrente Atual').should('be.visible');
    cy.contains('Voltagem Atual').should('be.visible');
  })

  it('deve exibir os valores de telemetria zerados antes de iniciar o percurso', () => {
    cy.contains('0.0s').should('be.visible');
    cy.contains('0.00 m').should('be.visible');
    cy.contains('0.00 m/s').should('be.visible');
    cy.contains('0 mA').should('be.visible');
    cy.contains('0.0 V').should('be.visible');
  })

  it('deve carregar a página e clicar no botão de iniciar, deve iniciar o log e mudar o status', () => {
    
    cy.contains('INICIAR', { matchCase: false, timeout: 10000 }).should('be.visible').click();
    cy.contains('Em execução').should('be.visible');
    cy.contains('Exploração iniciada').should('be.visible');
  });


  it('deve exibir todos os cards de telemetria ao carregar a pagina', () => {
    cy.contains(/INICIAR/i).click({ force: true });
    cy.wait(5000);
    cy.contains('0.0S').should('not.exist');
    cy.contains('0.00 M').should('not.exist');
    cy.contains('0.00 M/S').should('not.exist');
    cy.contains('0 MA').should('not.exist');
    cy.contains('0.0 v').should('not.exist');
  })

  it('deve exibir os graficos', () => {
    cy.contains('VELOCIDADE DURANTE O TESTE').should('be.visible');
    cy.contains('EVOLUÇÃO DA DISTÂNCIA').should('be.visible');
    cy.contains('VOLTAGEM DA BATERIA').should('be.visible');
    cy.contains('AMPERAGEM DA BATERIA').should('be.visible');
  })
});