describe('CT4 - Armazenamento de dados', () => {
    
    it('deve armazenar uma tentativa sem erros', () => {


        cy.visit('http://localhost:5173/historico')

        cy.get('table tbody tr').first().find('td').invoke('text').then((id)=>{
            const ultimoantes = id.trim()
            
            cy.visit('http://localhost:5173/percurso');
    
            cy.contains(/INICIAR/i).click({ force: true });
            cy.wait(10000)
            cy.contains(/CANCELAR/i).click({ force: true });

            cy.visit('http://localhost:5173/historico')
    
            cy.get('table tbody tr').first().find('td').invoke('text').then((novoId)=>{
                const ultimodepois = novoId.trim()
                expect(ultimoantes).to.not.equal(ultimodepois);
            })
        })

    })

    
})