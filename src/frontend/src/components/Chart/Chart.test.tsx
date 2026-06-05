import { render } from '@testing-library/react';
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
} from 'vitest';

import * as socketClient from 'socket.io-client';
import { Chart } from './Chart';

vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

vi.mock('../Icon', () => ({
  Icon: () => <div />,
}));

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(socketClient.io).mockReturnValue(
    mockSocket as any
  );
});

describe('Chart', () => {
  it('deve criar uma conexão websocket ao montar', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
      />
    );

    expect(socketClient.io).toHaveBeenCalledTimes(1);
  });

  it('deve registrar os listeners necessários', () => {
    render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
      />
    );

    expect(mockSocket.on).toHaveBeenCalledWith(
      'session_init',
      expect.any(Function)
    );

    expect(mockSocket.on).toHaveBeenCalledWith(
      'telemetria_viva',
      expect.any(Function)
    );

    expect(mockSocket.on).toHaveBeenCalledWith(
      'corrida_atualizada',
      expect.any(Function)
    );
  });

  it('deve desconectar o socket ao desmontar', () => {
    const { unmount } = render(
      <Chart
        title="Velocidade"
        dataKey="velocidade"
      />
    );

    unmount();

    expect(
      mockSocket.disconnect
    ).toHaveBeenCalledTimes(1);
  });

  it('cada gráfico cria sua própria conexão websocket', () => {
    render(
      <>
        <Chart title="Velocidade" dataKey="velocidade" />
        <Chart title="Tensão" dataKey="tensao" />
        <Chart title="Corrente" dataKey="corrente" />
        <Chart title="Distância" dataKey="distancia" />
      </>
    );

    expect(socketClient.io).toHaveBeenCalledTimes(4);
    expect(mockSocket.on).toHaveBeenCalledTimes(12);
  });

  it('demonstra o impacto de muitas instâncias', () => {
    render(
      <>
        {Array.from({ length: 100 }).map((_, index) => (
          <Chart
            key={index}
            title={`Chart ${index}`}
            dataKey="velocidade"
          />
        ))}
      </>
    );

    expect(socketClient.io).toHaveBeenCalledTimes(100);
    expect(mockSocket.on).toHaveBeenCalledTimes(300);
  });
});