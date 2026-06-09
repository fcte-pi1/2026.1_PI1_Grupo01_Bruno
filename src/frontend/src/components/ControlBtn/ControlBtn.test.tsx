import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeAll } from 'vitest'
import {ControlBtn} from './ControlBtn'

beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
})

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

    test('chama onStart ao iniciar', async () => {
        const onStart = vi.fn()
        render(<ControlBtn onStart={onStart} />)
        await userEvent.click(screen.getByRole('button', { name: /iniciar percurso/i }))
        expect(onStart).toHaveBeenCalled()
    })

    test('abre modal de confirmacao ao clicar em cancelar', async () => {
        render(<ControlBtn />)
        await userEvent.click(screen.getByRole('button', { name: /iniciar percurso/i }))
        await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
        expect(screen.getByText(/deseja cancelar percurso/i)).toBeInTheDocument()
    })


    test('abre modal de confirmacao ao clicar em reiniciar', async () => {
        render(<ControlBtn />)
        await userEvent.click(screen.getByRole('button', { name: /iniciar percurso/i }))
        await userEvent.click(screen.getByRole('button', { name: /reiniciar/i }))
        expect(screen.getByText(/deseja reiniciar o percurso/i)).toBeInTheDocument()
    })

    
})