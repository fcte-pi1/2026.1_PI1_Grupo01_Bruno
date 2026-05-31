import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { Connection } from './Connection'

vi.mock('../Badge', () => ({
    Badge: ({ type }: { type: string }) => (
        <div data-testid="badge" data-type={type} />
    )
}))

describe('ConnectionComponent', () => {
    test('renderiza a porta', () => {
        render(<Connection status="connected" port="COM3" />)
        expect(screen.getByText('COM3')).toBeInTheDocument()
    })

    test('mostra label correto para connected', () => {
        render(<Connection status="connected" port="COM3" />)
        expect(screen.getByText('Conectado')).toBeInTheDocument()
    })

    test('mostra label correto para warn', () => {
        render(<Connection status="warn" port="COM3" />)
        expect(screen.getByText('Com problemas')).toBeInTheDocument()
    })

    test('mostra label correto para disconnected', () => {
        render(<Connection status="disconnected" port="COM3" />)
        expect(screen.getByText('Desconectado')).toBeInTheDocument()
    })

    test('badge recebe success para connected', () => {
        render(<Connection status="connected" port="COM3" />)
        expect(screen.getByTestId('badge')).toHaveAttribute('data-type', 'success')
    })

    test('badge recebe success para warn', () => {
        render(<Connection status="warn" port="COM3" />)
        expect(screen.getByTestId('badge')).toHaveAttribute('data-type', 'warn')
    })

    test('badge recebe success para disconnected', () => {
        render(<Connection status="disconnected" port="COM3" />)
        expect(screen.getByTestId('badge')).toHaveAttribute('data-type', 'default')
    })
})