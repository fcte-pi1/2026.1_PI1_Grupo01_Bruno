import styles from './Connection.module.css'
import { Badge } from '../Badge'

interface ConnectionProps {
    status?: 'connected' | 'warn' | 'disconnected'
    port?: string
}

const STATUS_BADGE = {
    connected: 'success',
    warn: 'warn',
    disconnected: 'default',
} as const

const STATUS_LABEL = {
    connected: 'Conectado',
    warn: 'Com problemas',
    disconnected: 'Desconectado',
} as const

export function Connection({ status='disconnected', port }: ConnectionProps){
    return (
        <div className={styles.Connection}>
            <div className={`${styles.BadgeConnection} ${status === 'warn' ? styles.BadgeWarn : ''}`}>
                <Badge size='default' type={STATUS_BADGE[status]} />
            </div>
            <div className={styles.Info}>
                <span>{STATUS_LABEL[status]}</span>
                <small>{port}</small>
            </div>
        </div>
    )
}