import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { Badge } from './Badge'

describe('BadgeComponent', () => {
    test('renderiza com valores padrão', () => {
        const { container } = render(<Badge />)
        expect(container.firstChild).toBeInTheDocument()
    })

    test('aplica classe Badge', () => {
        const { container } = render(<Badge />)
        const badge = container.querySelector('[class*="Badge"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica classe lg', () => {
        const { container } = render(<Badge size="lg" />)
        const badge = container.querySelector('[class*="lg"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica classe sm', () => {
        const { container } = render(<Badge size="sm" />)
        const badge = container.querySelector('[class*="sm"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica classe success', () => {
        const { container } = render(<Badge type="success" />)
        const badge = container.querySelector('[class*="success"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica classe warn', () => {
        const { container } = render(<Badge type="warn" />)
        const badge = container.querySelector('[class*="warn"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica classe alert', () => {
        const { container } = render(<Badge type="alert" />)
        const badge = container.querySelector('[class*="alert"]')
        expect(badge).toBeInTheDocument()
    })

    test('aplica size e type juntos', () => {
        const { container } = render(<Badge size="lg" type="success" />)
        const badge = container.querySelector('[class*="lg"]')
        expect(badge?.className).toMatch(/success/)
    })

    test('nao aplica classe de type invalido', () => {
        // @ts-expect-error
        const { container } = render(<Badge type="invalid" />)
        expect(container?.querySelector('[class*="invalid"]')).not.toBeInTheDocument()
    })
})
