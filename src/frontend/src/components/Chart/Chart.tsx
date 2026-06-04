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
  points: any[];
}

export function Chart({
  title,
  icon,
  dataKey,
  points,
}: ChartProps) {
  const data = chartCalculations({
    points,
    dataKey,
  });

  return (
    <div className={styles.ChartContainer}>
      <div className={styles.ChartHeader}>
        <h6>{title}</h6>

        {icon && (
          <div className={styles.ChartMeta}>
            <Icon name={icon} />
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
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