import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { Log } from './Log'; // Confirme se o caminho de importação está correto

describe('Componente Log', () => {
    test('deve renderizar o título do componente', () => {
        
        render(<Log entries={[]} />);
        
       
        expect(screen.getByText(/Log de teste/i)).toBeInTheDocument();
    });
});