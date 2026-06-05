import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { Log } from './Log';

describe('LogComponent', () => {
    test('renderiza sem quebrar', () => {
        render(<Log entries={[]} />);
        expect(true).toBe(true);
    });
});