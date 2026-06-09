import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Table } from './Table';
import type { Column } from './Table'; 


type MockData = { id: number; status: string };

describe('Componente Table', () => {
    
    const colunasMock: Column<MockData>[] = [
        { key: 'id', label: 'ID', icon: 'tag' },
        { key: 'status', label: 'STATUS', icon: 'info' }
    ];
    
    const dadosMock: MockData[] = [
        { id: 1, status: 'Concluído' },
        { id: 2, status: 'Falhou' }
    ];

    test('deve renderizar os cabeçalhos das colunas', () => {
        render(<Table columns={colunasMock} data={dadosMock} />);
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('STATUS')).toBeInTheDocument();
    });

    test('deve renderizar os dados inseridos', () => {
        render(<Table columns={colunasMock} data={dadosMock} />);
        expect(screen.getByText('Concluído')).toBeInTheDocument();
        expect(screen.getByText('Falhou')).toBeInTheDocument();
    });

    test('deve renderizar o botão de exclusão se a função onDelete for passada', () => {
        const onDeleteMock = vi.fn();
        const { container } = render(<Table columns={colunasMock} data={dadosMock} onDelete={onDeleteMock} />);
        const deleteButtons = container.querySelectorAll('button');
        expect(deleteButtons.length).toBeGreaterThan(0);
    });
});