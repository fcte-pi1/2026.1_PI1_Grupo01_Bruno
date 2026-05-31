import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'


export function Dashboard() {
    const navigate = useNavigate()

    const stats=[
        { icon: 'science', label: 'Qtd. Testes', value: '152', size: 'lg' },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: '87%', size: 'lg' },
        { icon: 'timer', label: 'tempo médio', value: '43.3s', size: 'lg' },
        { icon: 'speed', label: 'Vel. média geral', value: '0.38 m/s', size: 'lg' },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: '3.8 Wh', size: 'lg' },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms' },
        { icon: 'alt_route', label: 'Eficiência de trajeto', value: '70,5%' },
        { icon: 'thermostat', label: 'Temp. média do sistema', value: '48°C' },
        { icon: 'shield', label: 'Confiabilidade geral', value: '92%' },
    ]
    return (
        <>
            <div className={styles.Cards}>
                {stats.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
                    </div>    
                ))}
            </div>

            <div>
                <Button icon='add' label='Novo percurso' onClick={() => navigate('/percurso')} />
            </div>
        </>
    )
}