import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import {Tab} from './Tab'

vi.mock('../Icon', () => ({
    Icon: ({ name }: { name: string }) => (
        <div data-testid="icon">{name}</div>
    ),
}))

describe('Tab component', () => {
    test('renderiza o label quando isBottom eh falso', () => {
        render(<Tab label="Dashboard" icon="home" />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    test('renderiza icon quando isActive', () => {
        render(<Tab label="Dashboard" icon="home" isActive />)
        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('renderiza icon quando isBottom', () => {
        render(<Tab label="Dashboard" icon="home" isBottom />)
        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('nao renderiza o label quando isBottom e !isActive', () => {
        render(<Tab label="Dashboard" icon="home" isBottom />)
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    test('renderiza o label quando isBottom e isActive', () => {
        render(<Tab label="Dashboard" icon="home" isBottom isActive />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    test('chama onClick ao ser clicado', async () => {
        const handleClick = vi.fn()
        render(<Tab label="Dashboard" icon="home" onClick={handleClick} />)
        
        const button = screen.getByRole('button')
        await userEvent.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})