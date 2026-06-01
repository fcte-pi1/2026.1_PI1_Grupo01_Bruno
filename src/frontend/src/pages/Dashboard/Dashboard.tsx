import { Card } from '../../components/Card'
import { Battery } from '../../components/Battery'
import { Connection } from '../../components/Connection'
import { Chart } from '../../components/Chart/Chart';
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'


export function Dashboard() {
    const navigate = useNavigate()

    // muda aqui os cards da dashboard
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
            <Chart
                title="Temperatura"
                icon="thermostat"
                event="historicoInicial"
                dataKey="temperatura"
                generalValue="48°C"
            />

            <div className={styles.Cards}>
                {stats.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
                    </div>    
                ))}
            </div>
        </>
    )
}