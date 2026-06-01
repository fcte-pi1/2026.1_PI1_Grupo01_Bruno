import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { onMock, offMock } = vi.hoisted(() => ({
  onMock: vi.fn(),
  offMock: vi.fn(),
}));

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: onMock,
    off: offMock,
  }),
}));

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

  CartesianGrid: () => (
    <div data-testid="cartesian-grid" />
  ),

  Tooltip: () => <div data-testid="tooltip" />,
}));

import { TemperatureChart } from './Chart';

describe('TemperatureChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza sem lançar erro quando não há dados', () => {
    const { getByTestId } = render(
      <TemperatureChart />
    );

    expect(
      getByTestId('responsive-container')
    ).toBeDefined();

    expect(
      getByTestId('area-chart')
    ).toBeDefined();
  });

  it('registra listener do socket ao montar', () => {
    render(<TemperatureChart />);

    expect(onMock).toHaveBeenCalledWith(
      'historicoInicial',
      expect.any(Function)
    );
  });

  it('remove listener do socket ao desmontar', () => {
    const { unmount } = render(
      <TemperatureChart />
    );

    unmount();

    expect(offMock).toHaveBeenCalledWith(
      'historicoInicial',
      expect.any(Function)
    );
  });

  it('renderiza todos os elementos principais do gráfico', () => {
    const { getByTestId } = render(
      <TemperatureChart />
    );

    expect(
      getByTestId('area')
    ).toBeDefined();

    expect(
      getByTestId('x-axis')
    ).toBeDefined();

    expect(
      getByTestId('y-axis')
    ).toBeDefined();

    expect(
      getByTestId('tooltip')
    ).toBeDefined();

    expect(
      getByTestId('cartesian-grid')
    ).toBeDefined();
  });
});