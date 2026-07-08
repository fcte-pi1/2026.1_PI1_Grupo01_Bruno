import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { Battery } from './Battery'

vi.mock('../Icon', () => ({
    Icon: ({ name }: { name: string }) => (
        <div data-testid="icon">{name}</div>
    )
}))

describe('BatteryComponent', () => {
    test('renderiza o nivel', () => {
        render(<Battery level={80} />)
        expect(screen.getByText('80%')).toBeInTheDocument()
    })

    test('renderiza a voltagem quando fornecida', () => {
        render(<Battery level={80} voltage={7.4} />)
        expect(screen.getByText('7.4V')).toBeInTheDocument()
    })
    
    test('nao renderiza voltagem quando nao fornecida', () => {
        render(<Battery level={80} />)
        expect(screen.queryByText(/V$/)).not.toBeInTheDocument()
    })
    
    test('status high para level acima de 50', () => {
        const { container } = render(<Battery level={80} />)
        expect(container.querySelector('[class*="high"]')).toBeInTheDocument()
    })
    
    test('status medium para level entre 21 e 50', () => {
        const { container } = render(<Battery level={40} />)
        expect(container.querySelector('[class*="medium"]')).toBeInTheDocument()
    })
    
    test('status low para level entre 1 e 20', () => {
        const { container } = render(<Battery level={15} />)
        expect(container.querySelector('[class*="low"]')).toBeInTheDocument()
    })
    
    test('status inactive para level 0', () => {
        const { container } = render(<Battery level={0} />)
        expect(container.querySelector('[class*="inactive"]')).toBeInTheDocument()
    })
})
