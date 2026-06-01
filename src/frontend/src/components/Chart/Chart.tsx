import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Icon } from '../Icon'
import styles from './Chart.module.css';

const socket = io(import.meta.env.VITE_API_URL);

interface ChartProps {
  title: string
  icon?: string
  event: string
  dataKey: string
  generalValue?: string
}

export function Chart({ title, icon, event, dataKey, generalValue }: ChartProps) {
  const [raw, setRaw] = useState<any>(null);

  useEffect(() => {
    socket.on(event, setRaw);

    return () => {
      socket.off(event, setRaw);
    };
  }, [event]);

  const chartData = Object.entries(raw?.telemetry || {})
    .map(([id, t]: any) => ({
      id,
      [dataKey]: Number(
        t[dataKey] ?? 0
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
      <div className={styles.ChartHeader}>
        <h6>{title}</h6>
        {generalValue && <div className={styles.ChartMeta}>
          {icon && <Icon name={icon} />}
          <span className={styles.MetaInfo}>{generalValue}</span>
        </div>}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--pumpkin-500)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--pumpkin-500)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="5 5" stroke="var(--border)" />

          <XAxis dataKey="hora" stroke="var(--txt-secondary)" />

          <YAxis stroke="var(--txt-secondary)" />

          <Tooltip />

          <Area 
            type="monotone"
            dataKey={dataKey}
            stroke="var(--pumpkin-500)"
            strokeWidth={3}
            fill={`url(#gradient-${dataKey})`}
            dot={{
              r: 5,
              fill: 'var(--pumpkin-500)',
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