import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { Cell } from './Cell'

describe('CellComponent', () => {
    test('renderiza como wall', () => {
        const { container } = render(<Cell wall />)
        const cell = container.firstChild as HTMLElement
        expect(cell.className).toMatch(/Wall/)
    })

    test('wall nao renderiza traces', () => {
        const { container } = render(<Cell wall />)
        const traces = container.querySelectorAll('[class*="Trace"]')
        expect(traces.length).toBe(0)
    })

    test('renderiza vazia sem props', () => {
        const { container } = render(<Cell />)
        const mouse = container.querySelector('[class*="MouseLoc"]')
        expect(mouse).not.toBeInTheDocument()
    })

    test('mostra MouseLoc quando so tem from', () => {
        const { container } = render(<Cell from="left" />)
        const mouse = container.querySelector('[class*="MouseLoc"]')
        expect(mouse).toBeInTheDocument()
    })

    test('nao mostra MouseLoc quando tem from e to', () => {
        const { container } = render(
            <Cell visits = {[{ from: 'left', to: 'right' }, { from: 'right', to: 'top' }]} />
        )
        expect(container.firstChild).toBeInTheDocument()
    })

    test('renderiza com visits', () => {
        const { container } = render(
            <Cell visits={[{ from: 'left', to: 'right' }, { from: 'right', to: 'top' }]} />
        )
        expect(container.firstChild).toBeInTheDocument()
    })

    test('visits nao mostra MouseLoc', () => {
        const { container } = render(
            <Cell visits={[{ from: 'left', to: 'right'}]} />
        )
        const mouse = container.querySelector('[class*="MouseLoc"]')
        expect(mouse).not.toBeInTheDocument()
    })

    test('wall ignora from e to', () => {
        const { container } = render(
            // @ts-expect-error
            <Cell wall from="left" to="right" />
        )
        const mouse = container.querySelector('[class*="MouseLoc"]')
        expect(mouse).not.toBeInTheDocument()
    })
})