import type { Page } from '../types/navigation'

export const PAGE_CONFIG: Record<Page, {
    route: string
    label: string
    description?: string
    showTopPage?: boolean
}> = {
    dashboard: {
        route: '/',
        label: 'Dashboard',
        description: 'Visão geral do sistema',
        showTopPage: true,
    },

    historico: {
        route: '/historico',
        label: 'Histórico',
        description: 'Registros de percursos anteriores',
        showTopPage: true,
    },

    projeto: {
        route: '/projeto',
        label: 'Projeto',
        description: 'Informações sobre o projeto',
    },

    equipe: {
        route: '/equipe',
        label: 'Equipe',
        description: 'Membros da equipe',
    },

    percurso: {
        route: '/percurso',
        label: 'Percurso',
        description: 'Acompanhe os dados da trajetória do micromouse no percurso.',
        showTopPage: true,
    },

    chassi: {
        route: '/chassi',
        label: 'Chassi',
        description: 'Explore o design mecânico do XAROPi.',
        showTopPage: true,
    },
}