import { Button } from '../Button'
import styles from './Log.module.css'

interface LogEntry {
    type: 'success' | 'warning' | 'info'
    time: string
    message: string
}

interface LogProps {
    entries?: LogEntry[]
    onViewFull?: () => void
    standalone?: boolean
}

export function Log({ entries = [], onViewFull, standalone = true }: LogProps){
    const center = (
        <div className={styles.LogCenter}>
            {entries.length === 0
            ? <code>Aguardando eventos...</code>
            : entries.map((entry, i) => (
                <code
                    key={i}
                    className={
                        entry.type === 'success' ? styles.Sucess
                        : entry.type === 'warning' ? styles.Warning
                        : ''
                    }
                >
                    {entry.time} {entry.message}
                </code>
            ))
            }
        </div>
    )

    if (!standalone) return center

    return (
        <div className={styles.LogContainer}>
            <div className={styles.Top}>
                <h6>Log de teste</h6>
                {onViewFull && (
                    <Button label="Ver log completo" icon="receipt_long" hierarchy="tertiary" density="high" onClick={onViewFull} />
                )}
            </div>
            {center}
        </div>
    )
}

// chama assim
{/* <Log entries={[
    '[09:01.105] Conectado',
    '[09:01.200] Conectado ao dispositivo',
    '[09:01.350] Percurso iniciado',
]} /> */}