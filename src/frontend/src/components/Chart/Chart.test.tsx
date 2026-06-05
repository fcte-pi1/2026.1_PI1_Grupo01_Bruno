import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Chart } from './Chart';

// Mock do Recharts para evitar problemas de renderização
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">
      {children}
    </div>
  ),
  AreaChart: ({ children }: any) => (
    <div data-testid="area-chart">
      {children}
    </div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock do Icon
vi.mock('../Icon', () => ({
  Icon: ({ name }: any) => (
    <span data-testid="icon">{name}</span>
  ),
}));

describe('Chart', () => {
  const points = [
    {
      timestamp: 1000,
      velocidade: 0.5,
      tensao: 7.4,
      corrente: 1.2,
    },
    {
      timestamp: 2000,
      velocidade: 0.8,
      tensao: 7.3,
      corrente: 1.5,
    },
  ];

  it('deve renderizar o título', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
        points={points}
      />
    );

    expect(
      screen.getByText('Velocidade')
    ).toBeInTheDocument();
  });

  it('deve renderizar o ícone quando informado', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
        icon="speed"
        points={points}
      />
    );

    expect(
      screen.getByTestId('icon')
    ).toHaveTextContent('speed');
  });

  it('não deve renderizar ícone quando não informado', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
        points={points}
      />
    );

    expect(
      screen.queryByTestId('icon')
    ).not.toBeInTheDocument();
  });

  it('deve renderizar os componentes do gráfico', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
        points={points}
      />
    );

    expect(
      screen.getByTestId('responsive-container')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('area-chart')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('area')
    ).toBeInTheDocument();
  });

});