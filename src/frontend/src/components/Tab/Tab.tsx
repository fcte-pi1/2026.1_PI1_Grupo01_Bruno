import styles from './Tab.module.css'
import { Icon } from '../Icon'

interface TabProps {
    label: string
    icon: string
    isActive?: boolean
    isBottom?: boolean
    onClick?: () => void
}

export function Tab({label, icon, isActive = false, onClick, isBottom = false}: TabProps){
    return(
        <button
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <div className={`${styles.txtMenu}`}>
                {(isActive || isBottom) && <Icon name={icon} size={isBottom ? 'lg' : 'base'} />}
                { ((isBottom && isActive) || (!isBottom)) && <span>{label}</span>}
            </div>
            { !isBottom && <div className={`${styles.lineIndicator} ${isActive ? styles.active : ''}`} />}
        </button>
    )
}