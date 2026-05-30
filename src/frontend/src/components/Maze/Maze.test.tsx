import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { Maze } from './Maze'

describe('MazeComponent', () => {
    test('renderiza 81 celulas com size 4 (9x9)', () => {
        const { container } = render(<Maze size={4} />)
        const cells = container.querySelectorAll('[class*="Cell"]')
        expect(cells.length).toBe(81)
    })

    test('renderiza 289 celulas com size 8 (17x17)', () => {
        const { container } = render(<Maze size={8} />)
        const cells = container.querySelectorAll('[class*="Cell"]')
        expect(cells.length).toBe(289)
    })

    test('renderiza 1089 celulas com size 16 (33x33)', () => {
        const { container } = render(<Maze size={16} />)
        const cells = container.querySelectorAll('[class*="Cell"]')
        expect(cells.length).toBe(1089)
    })

    test('usa size 4 como padrao', () => {
        const { container } = render(<Maze />)
        const cells = container.querySelectorAll('[class*="Cell"]')
        expect(cells.length).toBe(81)
    })

    test('aplica classe size4', () => {
        const { container } = render(<Maze size={4} />)
        const maze = container.querySelector('[class*="size4"]')
        expect(maze).toBeInTheDocument()
    })

    test('aplica classe size8', () => {
        const { container } = render(<Maze size={8} />)
        const maze = container.querySelector('[class*="size8"]')
        expect(maze).toBeInTheDocument()
    })

    test('aplica classe size16', () => {
        const { container } = render(<Maze size={16} />)
        const maze = container.querySelector('[class*="size16"]')
        expect(maze).toBeInTheDocument()
    })

    test('tem celulas wall', () => {
        const { container } = render(<Maze size={4} />)
        const walls = container.querySelectorAll('[class*="Wall"]')
        expect(walls.length).toBeGreaterThan(0)
    })

    test('nao renderiza size invalido como size8', () => {
        const { container } = render(<Maze size={4} />)
        const maze = container.querySelector('[class*="size8"]')
        expect(maze).not.toBeInTheDocument()
    })
})