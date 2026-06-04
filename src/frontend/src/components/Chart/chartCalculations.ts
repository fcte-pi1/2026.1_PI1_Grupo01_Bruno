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
      (a, b) => a.timestamp - b.timestamp
    );

    if (dataKey === 'distancia') {
      let distancia = 0;

      return ordered.map((item, index) => {
        if (index) {
          const previous = ordered[index - 1];

          distancia +=
            Number(item.velocidade ?? 0) *
            ((item.timestamp - previous.timestamp) / 1000);
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