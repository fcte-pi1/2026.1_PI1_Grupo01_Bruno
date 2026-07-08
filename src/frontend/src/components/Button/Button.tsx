import styles from './Button.module.css'
import { Icon } from '../Icon'

interface ButtonBaseProps {
    label?: string
    hierarchy ?: 'primary' | 'secondary' | 'tertiary'
    density ?: 'default' | 'high' | 'low'
    type ?: 'default' | 'circle'
    icon?: string
    onClick?: () => void
    className?: string
    ariaLabel?: string
    title?: string
}

interface ButtonDefault extends ButtonBaseProps {
    type?: 'default'
    label: string
}

interface ButtonCircle extends ButtonBaseProps {
    type: 'circle'
    label?: never
}

type ButtonProps = ButtonDefault | ButtonCircle

export function Button({ 
    label, 
    hierarchy = 'primary', 
    density = 'default', 
    type = 'default', 
    icon, 
    onClick, 
    className, 
    ariaLabel,
    title,
}: ButtonProps){
    const densityClass = {
        default: styles.densityDefault,
        high: styles.densityHigh,
        low: styles.densityLow,
    }[density]

    const iconSize = ({
        default: 'lg',
        high: 'base',
        low: '2x',
    }as const)[density]

    return (
        <button
            className={[
                styles.button,
                styles[hierarchy],
                densityClass,
                type == 'circle' ? styles.circle : '',
                className ?? '',
            ].join(' ')}
            onClick={onClick}
            title={title}
            {...(ariaLabel && { 'aria-label': ariaLabel })}>
            {icon && <Icon name={icon} size={iconSize} />}
            {type != 'circle' && label && <span>{label}</span>}
        </button>
    )
}