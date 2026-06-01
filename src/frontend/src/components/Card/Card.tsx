import styles from './Card.module.css'
import { Icon } from '../Icon'

interface CardProps {
    size?: 'default' | 'lg'
    icon: string
    label: string
    value: string
}

export function Card({ size = 'default', icon, label, value }: CardProps){
    const iconSize = ({
        default: '2x',
        lg: '2x',
    } as const)[size]

    return (
        <div 
            className={`${styles.card} ${styles[size]}`}
        >
            <Icon name={icon} size={iconSize} color="txt-interaction" />
            <div className={styles.texts}>
                <span>{label}</span>
                {size === 'lg' ? <h4>{value}</h4> : <h5>{value}</h5>}
            </div> 
        </div>
    )
}