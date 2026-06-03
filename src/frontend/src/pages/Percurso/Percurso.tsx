import { Card } from '../../components/Card'
import { ControlBtn } from '../../components/ControlBtn'
import { Maze } from '../../components/Maze'
import { Log } from '../../components/Log'
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
                <Maze  size={4} updates={ [
                    { index: 0, walls: { left: true, right: false, top: true, bottom: true } },
                    {index: 1, walls: { left: false, right: false, top: true, bottom: false} },
                    {index: 5, walls: { left: true, right: false, top: false, bottom: false } },
                    {index: 9, walls: { left: true, right: false, top: false, bottom: true} },
                    {index: 10, walls: { left: false, right: true, top: false, bottom: true} },
                    {index: 6, walls: { left: false, right: true, top: true, bottom: false } }
                ]}
                path={[0, 1, 5, 9, 10, 6]}/>
                <div className={styles.InfosLog}>
                    <div className={styles.ControlCards}>
                        {cards.map(card => (
                            <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />
                        ))}
                    </div>
                    {/* <Log entries={[
                        '[09:01.105] Conectado',
                        '[09:01.200] Conectado ao dispositivo',
                        '[09:01.350] Percurso iniciado',
                    ]} /> */}
                </div>
            </div>

            <div className={styles.Charts} />
        </div>
    )
}