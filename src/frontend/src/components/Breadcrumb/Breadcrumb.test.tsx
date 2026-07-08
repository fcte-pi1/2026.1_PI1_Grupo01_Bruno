import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

const renderWithRouter = (path: string) => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Breadcrumb />
        </MemoryRouter>
    )
}

describe('BreadcrumbComponent', () => {
    test('renderiza link para Dashboard', () => {
        renderWithRouter('/')
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    test('na rota raiz nao mostra segmentos extras', () => {
        renderWithRouter('/')
        expect(screen.queryByText('>')).not.toBeInTheDocument()
    })
    
    test('mostra label correto para historico', () => {
        renderWithRouter('/historico')
        expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && (el?.textContent?.includes('Histórico') ?? false))).toBeInTheDocument()
    })
    
    test('mostra label correto para projeto', () => {
        renderWithRouter('/projeto')
        expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && (el?.textContent?.includes('Projeto') ?? false))).toBeInTheDocument()
    })
    
    test('mostra label correto para equipe', () => {
        renderWithRouter('/equipe')
        expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && (el?.textContent?.includes('Equipe') ?? false))).toBeInTheDocument()
    })
    
    test('mostra o segmento bruto se nao tiver label', () => {
        renderWithRouter('/pagina-desconhecida')
        expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && (el?.textContent?.includes('pagina-desconhecida') ?? false))).toBeInTheDocument()
    })

    test('Dashboard é um link para /', () => {
        renderWithRouter('/equipe')
        const link = screen.getByRole('link', { name: 'Dashboard' })
        expect(link).toHaveAttribute('href', '/')
    })

    test('ultimo segmento nao é link', () => {
        renderWithRouter('/equipe')
        const links = screen.getAllByRole('link')
        const textos = links.map(l => l.textContent)
        expect(textos).not.toContain('Equipe')
    })
})