import styles from './Badge.module.css'

interface BadgeProps {
    size?: 'default' | 'lg' | 'sm',
    type?: 'default' | 'success' | 'warn' | 'alert'
}

export function Badge({ size = 'default', type = 'default' }: BadgeProps){
    return (
       <div className={`${styles.Badge} ${styles[size]} ${styles[type]}`}></div>
    )
}