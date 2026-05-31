import { Card } from '../../components/Card'
import { ControlBtn } from '../../components/ControlBtn'
import { Maze } from '../../components/Maze'
import styles from './Percurso.module.css'

export function Percurso() {
    const cards=[
        { icon: 'science', label: 'Qtd. Testes', value: '152' },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: '87%' },
        { icon: 'timer', label: 'tempo médio', value: '43.3s' },
        { icon: 'speed', label: 'Vel. média geral', value: '0.38 m/s' },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: '3.8 Wh' },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms' },
    ]

    return (
        <div className={styles.MainTest}>
            <div className={styles.TopInfos}>
                <h3>Percurso</h3>
                <ControlBtn />
            </div>

            <div className={styles.Content}>
                <Maze />
                <div className={styles.InfosLog}>
                    <div className={styles.ControlCards}>
                        {cards.map(card => (
                            <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.Charts} />
        </div>
    )
}