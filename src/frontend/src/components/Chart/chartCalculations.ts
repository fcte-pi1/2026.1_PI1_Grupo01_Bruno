import { useMemo } from 'react';

interface Props {
  points: any[];
  dataKey: string;
}

export function chartCalculations({ points = [], dataKey }: Props) {
   return useMemo(() => {
     const ordered = [...points].sort(
       (a, b) => Number(a.timestamp) - Number(b.timestamp)
     );

    if (dataKey === 'distancia') {
      return ordered.map(item => ({
        distancia: Number(item.distancia ?? 0),
        hora: new Date(item.timestamp).toLocaleTimeString('pt-BR'),
      }));
    }

    return ordered.map(item => ({
      [dataKey]: Number(item[dataKey] ?? 0),
      hora: new Date(item.timestamp).toLocaleTimeString('pt-BR'),
    }));
  }, [points, dataKey]);
}