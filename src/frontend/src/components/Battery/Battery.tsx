import styles from './Battery.module.css'
import { Icon } from '../Icon'

const TOTAL_BARS = 10

interface BatteryProps {
    level?: number,
    voltage?: number
}

function getBatteryStatus(level: number) {
    if (level === 0) return 'inactive'
    if (level <= 20) return 'low'
    if (level <= 50) return 'medium'
    return 'high'
}

export function Battery({ level, voltage }: BatteryProps){
    const activeBars = level !== undefined ? Math.round((level / 100) * TOTAL_BARS) : 0
    const status = level !== undefined ? getBatteryStatus(level) : 'inactive'

    return (
        <div className={styles.BatteryContainer}>
            <div className={styles.LevelTop}>
                <Icon name='bolt' size='lg' />
                <span>Bateria</span>
                {voltage !== undefined && <span className={styles.CodeTxt}>{voltage}V</span>}
            </div>
            <div className={`${styles.LevelBottom} ${status ? styles[status] : ''}`}>
                {level !== undefined && <span className={styles.CodeTxt}>{level}%</span>}
                <div className={styles.LevelBars}>
                    {Array.from({ length: TOTAL_BARS }, (_, i) => (
                        <div
                            key={i}
                            className={`${styles.Bar} ${i < activeBars ? styles.Active : styles.Inactive}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}