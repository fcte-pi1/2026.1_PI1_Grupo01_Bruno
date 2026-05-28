import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import {Card} from './Card'

vi.mock('../Icon', () => ({
    Icon: ({ name }: { name: string }) => (
        <div data-testid="icon">{name}</div>
    ),
}))

describe('Card component', () => {
    test('renderiza o label, value e icon', () => {
        render(<Card icon="vasco" label="Velocidade" value="5" />)
        expect(screen.getByText('Velocidade')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('renderiza h5 quando o size é default', () => {
        render(<Card icon="vasco" label="Velocidade" value="5" />)
        expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument()
    })

    test('renderiza h4 quando o size é lg', () => {
        render(<Card icon="vasco" label="Velocidade" value="5" size="lg" />)
        expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    })
})