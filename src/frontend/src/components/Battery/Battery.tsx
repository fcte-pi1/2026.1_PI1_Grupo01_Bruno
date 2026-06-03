import styles from './Battery.module.css'
import { Icon } from '../Icon'

const TOTAL_BARS = 10

interface BatteryProps {
    level: number,
    voltage?: number
}

function getBatteryStatus(level: number) {
    if (level === 0) return 'inactive'
    if (level <= 20) return 'low'
    if (level <= 50) return 'medium'
    return 'high'
}

export function Battery({ level, voltage }: BatteryProps){
    const activeBars = Math.round((level / 100) * TOTAL_BARS)
    const status = getBatteryStatus(level)

    return (
        <div className={styles.BatteryContainer}>
            <div className={styles.LevelTop}>
                <Icon name='bolt' size='lg' />
                <label>Bateria</label>
                {voltage && <span className={styles.CodeTxt}>{voltage}V</span>}
            </div>
            <div className={`${styles.LevelBottom} ${styles[status]}`}>
                <span className={styles.CodeTxt}>{level}%</span>
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