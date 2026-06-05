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
import { chartCalculations } from './chartCalculations';
import styles from './Chart.module.css';

interface ChartProps {
  title: string;
  icon?: string;
  dataKey: string;
}

export function Chart({
  title,
  icon,
  dataKey,
}: ChartProps) {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL,
      {
        query: {
          role: 'frontend',
        },
      }
    );

    const handleSessionInit = ({
      corrida,
    }: any) => {
      setPoints(
        corrida?.telemetria
          ? Object.values(
              corrida.telemetria
            )
          : []
      );
    };

    const handleTelemetriaViva = (
      data: any
    ) => {
      setPoints(prev => [
        ...prev,
        data,
      ]);
    };

    const handleCorridaAtualizada = ({
      reset,
    }: any) => {
      if (reset) {
        setPoints([]);
      }
    };

    socket.on(
      'session_init',
      handleSessionInit
    );

    socket.on(
      'telemetria_viva',
      handleTelemetriaViva
    );

    socket.on(
      'corrida_atualizada',
      handleCorridaAtualizada
    );

    return () => {
      socket.off(
        'session_init',
        handleSessionInit
      );

      socket.off(
        'telemetria_viva',
        handleTelemetriaViva
      );

      socket.off(
        'corrida_atualizada',
        handleCorridaAtualizada
      );

      socket.disconnect();
    };
  }, []);

  const data = chartCalculations({
    points,
    dataKey,
  });

  return (
    <div className={styles.ChartContainer}>
      <div className={styles.ChartHeader}>
        <h6>{title}</h6>

        {icon && (
          <div
            className={
              styles.ChartMeta
            }
          >
            <Icon name={icon} />
          </div>
        )}
      </div>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="hora" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#ff7a00"
            fill="rgba(255,122,0,0.2)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}