import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import {Header} from './Header'

vi.mock('../Tab', () => ({
    Tab: ({
        label,
        isActive,
        onClick,
    }:{
        label: string,
        isActive?: boolean,
        onClick?: () => void
    }) => (
        <button onClick={onClick} data-active={isActive} data-testid={`tab-${label}`}>{label}</button>   
    ),
}))

vi.mock('../Logo', () => ({
    Logo: () =>(<div data-testid="logo">Logo</div>),
}))


describe('Header component', () => {
    test('renderiza o logo', () => {
        render(<Header />)
        expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    test('renderiza as tabs', () => {
            render(<Header />)
            
            expect(screen.getByTestId('tab-Dashboard')).toBeInTheDocument()
            expect(screen.getByTestId('tab-Histórico')).toBeInTheDocument()
            expect(screen.getByTestId('tab-Projeto')).toBeInTheDocument()
            expect(screen.getByTestId('tab-Equipe')).toBeInTheDocument()
    })

    test('chama onPageChange ao clicar em uma tab', async () => {
        const handlePageChange = vi.fn()
        render(<Header onPageChange={handlePageChange} />)

        const equipeTab = screen.getByTestId('tab-Equipe')
        await userEvent.click(equipeTab)

        expect(handlePageChange).toHaveBeenCalledWith('equipe')
    })

    test('marca a pagina ativa corretamente', () => {
        render(<Header currentPage="projeto" />)
        expect(screen.getByTestId('tab-Projeto')).toHaveAttribute('data-active', 'true')
    })

    test('nao marca a pagina incorreta como ativa', () => {
        render(<Header currentPage="projeto" />)
        expect(screen.getByTestId('tab-Dashboard')).toHaveAttribute('data-active', 'false')
        expect(screen.getByTestId('tab-Histórico')).toHaveAttribute('data-active', 'false')
        expect(screen.getByTestId('tab-Equipe')).toHaveAttribute('data-active', 'false')
    })

    test('chama onThemeToggle ao clicar no botão de teme', async () => {
        const handleThemeToggle = vi.fn()
        render(<Header onThemeToggle={handleThemeToggle} />) 
        
        const buttons = screen.getAllByRole('button')
        const themeButton = buttons[buttons.length - 1]

        await userEvent.click(themeButton)

        expect(handleThemeToggle).toHaveBeenCalledTimes(1)

    })

})   