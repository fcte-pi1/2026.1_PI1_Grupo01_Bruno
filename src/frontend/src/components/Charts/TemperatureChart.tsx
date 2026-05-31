import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import styles from './TemperatureChart.module.css';

const socket = io(import.meta.env.VITE_API_URL);

export function TemperatureChart() {
  const [raw, setRaw] = useState<any>(null);

  useEffect(() => {
    socket.on('historicoInicial', setRaw);

    return () => {
      socket.off('historicoInicial', setRaw);
    };
  }, []);

  const telemetry = Object.entries(
    raw?.telemetry || {}
  );

  const chartData = telemetry
    .map(([id, t]: any) => ({
      id,
      temperatura: Number(
        t.temperatura ?? 0
      ),
      timestamp: new Date(
        t.timestamp
      ),
    }))
    .sort(
      (a, b) =>
        a.timestamp.getTime() -
        b.timestamp.getTime()
    )
    .map((item) => ({
      ...item,
      hora: item.timestamp.toLocaleTimeString(
        'pt-BR'
      ),
    }));

  return (
    <div className={styles.ChartContainer}>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id="tempGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#ff7a00"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="#ff7a00"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#444"
          />

          <XAxis
            dataKey="hora"
            stroke="#aaa"
          />

          <YAxis stroke="#aaa" />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="temperatura"
            stroke="#ff7a00"
            strokeWidth={3}
            fill="url(#tempGradient)"
            dot={{
              r: 5,
              fill: '#ff7a00',
            }}
            activeDot={{
              r: 7,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}