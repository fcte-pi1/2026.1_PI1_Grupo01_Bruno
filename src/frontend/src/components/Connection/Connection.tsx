import styles from './Connection.module.css'
import { Badge } from '../Badge'

interface ConnectionProps {
    status: 'connected' | 'warn' | 'disconnected'
    port: string
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

export function Connection({ status, port }: ConnectionProps){
    return (
        <div className={styles.Connection}>
            <Badge size='default' type={STATUS_BADGE[status]} />
            <div className={styles.Info}>
                <label>{STATUS_LABEL[status]}</label>
                <small>{port}</small>
            </div>
        </div>
    )
}