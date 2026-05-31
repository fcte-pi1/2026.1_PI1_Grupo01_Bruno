import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import {ControlBtn} from './ControlBtn'

describe('ControlBtn component', () => {
    test('renderiza o estado inicial', () => {
        render(<ControlBtn />)
        expect(screen.getByRole('button', { name: /iniciar percurso/i })).toBeInTheDocument()
    })

    test('vai para rodando ao iniciar', async () => {
        render(<ControlBtn />)
        await userEvent.click(screen.getByRole('button', { name: /iniciar percurso/i }))
        expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /reiniciar/i })).toBeInTheDocument()
    })

    test('vai para pausado ao pausar', async () => {
        render(<ControlBtn />)
        await userEvent.click(screen.getByRole('button', { name: /iniciar percurso/i }))
        await userEvent.click(screen.getByRole('button', { name: /pausar/i }))
        expect(screen.getByRole('button', { name: /retomar/i })).toBeInTheDocument()
    })
})