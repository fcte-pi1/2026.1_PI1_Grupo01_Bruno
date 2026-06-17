import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import type { TooltipContentProps } from 'recharts';

import { Icon } from '../Icon';
import { chartCalculations } from './chartCalculations';
import styles from './Chart.module.css';

interface ChartProps {
  title: string;
  icon?: string;
  dataKey: string;
  points: any[]; 
}

export function Chart({ title, icon, dataKey, points }: ChartProps) {
  const data = chartCalculations({ points, dataKey });

  const averageValue =
    data.length > 0
      ? data.reduce((acc, item) => acc + ((item as any)[dataKey] ?? 0), 0) / data.length
      : null;

  const formatValue = (value: number) => {
      const rounded = Number(value.toFixed(3));
      if (dataKey === 'velocidade') return `${rounded} m/s`;
      if (dataKey === 'distancia') return `${rounded} m`;
      if (dataKey === 'tensao') return `${rounded} V`;
      if (dataKey === 'corrente') return `${rounded} mA`;
      return rounded;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
    const firstPayload = payload?.[0];
    const isVisible = active && firstPayload != null;

    if (!isVisible) return null;

    return (
      <div className={styles.Tooltip}>
        <span className={styles.TooltipLabel}>{label}</span>
        <span className={styles.TooltipValue}>
          {formatValue(Number(firstPayload.value))}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.ChartContainer}>
      <div className={styles.ChartHeader}>
        <h6>{title}</h6>

        {icon && averageValue !== null && (
          <div className={styles.ChartMeta}>
            <Icon name={icon} />
            {averageValue !== null && (
              <span className={styles.MetaInfo}>
                {formatValue(averageValue)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}> */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -40, right: 0, top: 0, bottom: 0 }}>
              <defs>
                  <linearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--pumpkin-500)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--pumpkin-500)" stopOpacity={0} />
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip
                content={CustomTooltip} 
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="var(--pumpkin-500)"
                fill="url(#gradientOrange)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
    //   </div>
    // </div>
  );
}