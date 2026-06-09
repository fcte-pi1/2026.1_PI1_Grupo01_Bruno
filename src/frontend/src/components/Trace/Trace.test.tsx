import {render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { Trace } from './Trace'

describe('TraceComponent', () => {
    test('renderiza sem side', () => {
        const { container } = render(<Trace />)
        const inner = container.querySelector('.TraceInner')
        expect(inner).not.toBeInTheDocument()
    })

    test('renderiza com side', () => {
        const { container } = render(<Trace side="left" />)
        const inner = container.querySelector('[class*="TraceInner"]')
        expect(inner).toBeInTheDocument()
    })

    test('aplica revisit', () => {
        const { container } = render(<Trace side="left" revisit />)
        const inner = container.querySelector('[class*="revisit"]')
        expect(inner).toBeInTheDocument()
    })

    test('nao aplica revisit sem side', () => {
        const { container } = render(<Trace revisit />)
        const inner = container.querySelector('[class*="TraceInner"]')
        expect(inner).not.toBeInTheDocument()
    })

    test('nao aplica classe de side inexistente', () => {
        // @ts-expect-error testando prop inválida
        const { container } = render(<Trace side="invalid" /> )
        const inner = container.querySelector('[class*="TraceInner"]')
        expect(inner).not.toBeInTheDocument()
    })

    test('nao renderiza TraceInner sem side mesmo com revisit', () => {
        const { container } = render(<Trace revisit />)
        const inner = container.querySelector('[class*="TraceInner"]')
        expect(inner).not.toBeInTheDocument()
    })

    test('revisit sem side nao aplica classe revisit', () => {
        const { container } = render(<Trace revisit />)
        const revisitE1 = container.querySelector('[class*="revisit"]')
        expect(revisitE1).not.toBeInTheDocument()
    })
})