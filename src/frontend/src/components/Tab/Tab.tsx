import styles from './Tab.module.css'
import { Icon } from '../Icon'

interface TabProps {
    label: string
    icon: string
    isActive?: boolean
    onClick?: () => void
}

export function Tab({label, icon, isActive = false, onClick}: TabProps){
    return(
        <button
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            {isActive && (<Icon name={icon} size="base" />
            )}
            <span className={styles.label}>{label}</span>
            {isActive && <span className={styles.indicator} />}
        </button>
    )
}