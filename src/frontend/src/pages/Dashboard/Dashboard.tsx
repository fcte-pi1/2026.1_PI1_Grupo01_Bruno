import { Card } from '../../components/Card'
import { Battery } from '../../components/Battery'
import { Connection } from '../../components/Connection';
import { Chart } from '../../components/Chart/Chart';
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'


export function Dashboard() {
  const navigate = useNavigate();

  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      query: { role: 'frontend' },
    });

    const handleSessionInit = ({ corrida }: any) => {
      setPoints(
        corrida?.telemetria
          ? Object.values(corrida.telemetria)
          : []
      );
    };

    const handleTelemetriaViva = (data: any) => {
      setPoints(prev => [...prev, data]);
    };

    const handleCorridaAtualizada = ({ reset }: any) => {
      if (reset) {
        setPoints([]);
      }
    };

    socket.on('session_init', handleSessionInit);
    socket.on('telemetria_viva', handleTelemetriaViva);
    socket.on('corrida_atualizada', handleCorridaAtualizada);

    return () => {
      socket.off('session_init', handleSessionInit);
      socket.off('telemetria_viva', handleTelemetriaViva);
      socket.off('corrida_atualizada', handleCorridaAtualizada);

      socket.disconnect();
    };
  }, []);

    const stats: { icon: string; label: string; value: string; size?: 'default' | 'lg' }[] =[ 
        { icon: 'science', label: 'Qtd. Testes', value: '152', size: 'lg' },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: '87%', size: 'lg' },
        { icon: 'timer', label: 'tempo médio', value: '43.3s', size: 'lg' },
        { icon: 'speed', label: 'Vel. média geral', value: '0.38 m/s', size: 'lg' },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: '3.8 Wh', size: 'lg' },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms', size: 'default' },
        { icon: 'alt_route', label: 'Eficiência de trajeto', value: '70,5%', size: 'default' },
        { icon: 'thermostat', label: 'Temp. média do sistema', value: '48°C', size: 'default' },
        { icon: 'shield', label: 'Confiabilidade geral', value: '92%', size: 'default' },
  ]
  return (
    <>
      <div>
        <Button icon='add' label='Novo percurso' onClick={() => navigate('/percurso')} />
      </div>

      <Card
        icon="analytics"
        label="Total de usuários"
        value="1.240"
      />

            <Battery level={80} voltage={7.4} />

            <Battery level={50} />

            <Battery level={20} voltage={3.7} />

            <Battery level={0} />


            <Connection status="connected" port="COM3" />

            <Connection status="warn" port="COM3" />

            <Connection status="disconnected" port="COM3" />

            <Battery level={80} voltage={7.4} />

            <Battery level={50} />

            <Battery level={20} voltage={3.7} />

            <Battery level={0} />


            <Connection status="connected" port="COM3" />

            <Connection status="warn" port="COM3" />

            <Connection status="disconnected" port="COM3" />

      <div className={styles.Cards}>
        {stats.map(stat => (
          <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                <Card key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
          </div>
        ))}
      </div>

      <Chart
        title="Velocidade"
        dataKey="velocidade"
        icon="speed"
        points={points}
      />

      <Chart
        title="Voltagem"
        dataKey="tensao"
        icon="bolt"
        points={points}
      />

      <Chart
        title="Amperagem"
        dataKey="corrente"
        icon="electric_bolt"
        points={points}
      />

      <Chart
        title="Distância Percorrida"
        dataKey="distancia"
        icon="alt_route"
        points={points}
      />
    </>
  );
}