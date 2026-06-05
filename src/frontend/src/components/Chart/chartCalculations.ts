import { useMemo } from 'react';

interface Props {
  points: any[];
  dataKey: string;
}

export function chartCalculations({
  points,
  dataKey,
}: Props) {
  return useMemo(() => {
    const ordered = [...points].sort(
      (a, b) => Number(a.timestamp) - Number(b.timestamp)
    );

    if (dataKey === 'distancia') {
      let distancia = 0;

      return ordered.map((item, index) => {
        if (index) {
          const previous = ordered[index - 1];

        distancia +=
          (Number(String(item.velocidade).replace(/[^\d.-]/g, '')) || 0) *
          ((Number(item.timestamp) - Number(previous.timestamp)) / 1000);
        }

        return {
          distancia,
          hora: new Date(item.timestamp)
            .toLocaleTimeString('pt-BR'),
        };
      });
    }

    return ordered.map(item => ({
      [dataKey]: Number(item[dataKey] ?? 0),
      hora: new Date(item.timestamp)
        .toLocaleTimeString('pt-BR'),
    }));
  }, [points, dataKey]);
}