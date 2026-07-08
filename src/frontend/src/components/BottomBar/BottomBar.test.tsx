import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import {BottomBar} from './BottomBar'

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

describe('BottomBar component', () => {
    test('renderiza as tabs', () => {
        render(<BottomBar />)
        
        expect(screen.getByTestId('tab-Dashboard')).toBeInTheDocument()
        expect(screen.getByTestId('tab-Histórico')).toBeInTheDocument()
        expect(screen.getByTestId('tab-Projeto')).toBeInTheDocument()
        expect(screen.getByTestId('tab-Equipe')).toBeInTheDocument()
    })

    test('chama onPageChange ao clicar em uma tab', async () => {
        const handlePageChange = vi.fn()
        render(<BottomBar onPageChange={handlePageChange} />)

        const equipeTab = screen.getByTestId('tab-Equipe')
        await userEvent.click(equipeTab)

        expect(handlePageChange).toHaveBeenCalledWith('equipe')
    })

    test('marca a pagina ativa corretamente', () => {
        render(<BottomBar currentPage="projeto" />)
        expect(screen.getByTestId('tab-Projeto')).toHaveAttribute('data-active', 'true')
    })

    test('nao marca a pagina incorreta como ativa', () => {
        render(<BottomBar currentPage="projeto" />)
        expect(screen.getByTestId('tab-Dashboard')).toHaveAttribute('data-active', 'false')
        expect(screen.getByTestId('tab-Histórico')).toHaveAttribute('data-active', 'false')
        expect(screen.getByTestId('tab-Equipe')).toHaveAttribute('data-active', 'false')
    })
})