import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import {Button} from './Button'

vi.mock('../Icon', () => ({
    Icon: ({ name }: { name: string }) => (
        <div data-testid="icon">{name}</div>
    ),
}))

describe('Button component', () => {
    test('renderiza o label', () => {
        render(<Button label="Iniciar" />)

        expect(screen.getByText('Iniciar')).toBeInTheDocument()
    })

    test('chama onClick ao ser clicado', async () => {
        const handleClick = vi.fn()
        render(<Button label="Iniciar" onClick={handleClick} />)
        
        const button = screen.getByRole('button')
        await userEvent.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('renderiza o icone qunado enviado', () =>{
        render(<Button label="Iniciar" icon="plus" />)

        expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    test('nao renderiza o label quando type for circle', () => {
        render(<Button type="circle" icon="plus" />)

        expect(screen.queryByText('Iniciar')).not.toBeInTheDocument()  
    })
})