import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

vi.mock('../Button', () => ({
    Button: ({ label, icon, onClick }: {label?: string; icon?: string; onClick?: () => void }) => (
        <button onClick={onClick} data-testid={icon ?? 'btn' }>
            {label}
        </button>
    )
}))

describe('ModalComponent', () => {
    test('renderiza quando open=true', () => {
        render(<Modal open title="Teste" onClose={() => {}} />)
        expect(screen.getByText('Teste')).toBeInTheDocument()
    })
    
    test('nao renderiza conteudo quando open=false', () => {
        render(<Modal open={false} title="Teste" onClose={() => {}} />)
        const dialog = document.querySelector('dialog')
        expect(dialog).not.toHaveAttribute('open')
    })

    test('renderiza closeBtn por padrao', () => {
        render(<Modal open title="Teste" onClose={() => {}} />)
        expect(screen.getByTestId('close')).toBeInTheDocument()
    })

    test('chama onClose ao clicar no closeBtn', async () => {
        const onClose = vi.fn()
        render(<Modal open title="Teste" onClose={onClose} />)
        await userEvent.click(screen.getByTestId('close'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('renderiza btnPrimary com label', () => {
        render(<Modal open title="Teste" onClose={() => {}} btnPrimary labelBtnPrimary="Confirmar" />)
        expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })

    test('renderiza btnSecondary com label', () => {
        render(<Modal open title="Teste" onClose={() => {}} btnSecondary labelBtnSecondary="Cancelar" />)
        expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    test('nao renderiza footer sem botoes', () => {
        render(<Modal open title="Teste" onClose={() => {}} />)
        expect(document.querySelector('footer')).not.toBeInTheDocument()
    })

    test('renderiza children', () => {
        render(
            <Modal open title="Teste" onClose={() => {}}>
                <p>Conteúdo</p>
            </Modal>
        )
        expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    })
})