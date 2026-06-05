import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { Table } from './Table';

describe('TableComponent', () => {
    test('renderiza sem quebrar', () => {
        render(<Table columns={[]} data={[]} />);
        expect(true).toBe(true);
    });
});