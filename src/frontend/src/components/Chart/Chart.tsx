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

import { Icon } from '../Icon';
import styles from './Chart.module.css';

const socket = io(import.meta.env.VITE_API_URL, {
  query: {
    role: 'frontend',
  },
});

interface ChartProps {
  title: string;
  icon?: string;
  event: string;
  dataKey: string;
  generalValue?: string;
}

export function Chart({
  title,
  icon,
  event,
  dataKey,
  generalValue,
}: ChartProps) {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const handleHistorico = (data: any) => {
      if (!data?.corridas) {
        return;
      }

      const corridas = Object.values(data.corridas) as any[];

      if (!corridas.length) {
        return;
      }

      const corridasComTelemetria = corridas.filter(
        (corrida) =>
          corrida?.telemetria &&
          Object.keys(corrida.telemetria).length > 0
      );

      if (!corridasComTelemetria.length) {
        console.warn('Nenhuma corrida com telemetria encontrada');
        return;
      }

      const ultimaCorrida = corridasComTelemetria
        .sort(
          (a, b) =>
            (a.metadados?.inicio_timestamp ?? 0) -
            (b.metadados?.inicio_timestamp ?? 0)
        )
        .at(-1);

      if (!ultimaCorrida?.telemetria) {
        return;
      }

      const historico = Object.values(
        ultimaCorrida.telemetria
      ) as any[];

      setPoints(historico);
    };

    const handleLiveUpdate = (novaLeitura: any) => {
      setPoints((prev) => [...prev, novaLeitura]);
    };

    socket.on('historicoInicial', handleHistorico);

    // usa a prop event
    socket.on(event, handleLiveUpdate);

    return () => {
      socket.off('historicoInicial', handleHistorico);
      socket.off(event, handleLiveUpdate);
    };
  }, [event]);

  const chartData = points
    .map((item) => ({
      [dataKey]: Number(item[dataKey] ?? 0),
      timestamp: Number(item.timestamp),
      hora: new Date(
        Number(item.timestamp)
      ).toLocaleTimeString('pt-BR'),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className={styles.ChartContainer}>
      <div className={styles.ChartHeader}>
        <h6>{title}</h6>

        {generalValue && (
          <div className={styles.ChartMeta}>
            {icon && <Icon name={icon} />}
            <span className={styles.MetaInfo}>
              {generalValue}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={`gradient-${dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--pumpkin-500)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--pumpkin-500)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="5 5"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="hora"
            stroke="var(--txt-secondary)"
          />

          <YAxis
            stroke="var(--txt-secondary)"
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="var(--pumpkin-500)"
            strokeWidth={3}
            fill={`url(#gradient-${dataKey})`}
            isAnimationActive={false}
            dot={{
              r: 4,
              fill: 'var(--pumpkin-500)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}