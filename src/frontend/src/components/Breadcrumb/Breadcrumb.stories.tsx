import type { Meta } from "@storybook/react-vite";
import { MemoryRouter } from 'react-router-dom'

import { Breadcrumb } from './Breadcrumb';


const meta = {
    component: Breadcrumb,
    title: 'Breadcrumb',
    tags: ['autodocs'],
} as Meta;

export default meta;

export const Index = () => {
    <MemoryRouter initialEntries={['/']}>
            <Breadcrumb />
        </MemoryRouter>
}

export const Historico = () => {
    <MemoryRouter initialEntries={['/historico']}>
            <Breadcrumb />
        </MemoryRouter>
}

export const Projeto = () => {
    <MemoryRouter initialEntries={['/projeto']}>
            <Breadcrumb />
        </MemoryRouter>
}

export const Equipe = () => {
    <MemoryRouter initialEntries={['/equipe']}>
            <Breadcrumb />
        </MemoryRouter>
}

export const Pagina_Desconhecida = () => {
    <MemoryRouter initialEntries={['/pagina-desconhecida']}>
            <Breadcrumb />
        </MemoryRouter>
}