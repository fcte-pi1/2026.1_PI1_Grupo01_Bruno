import styles from './Badge.module.css'

const VALID_SIZES = ['default', 'lg', 'sm'] as const
const VALID_TYPES = ['default', 'success', 'warn', 'alert'] as const

interface BadgeProps {
    size?: 'default' | 'lg' | 'sm',
    type?: 'default' | 'success' | 'warn' | 'alert'
}

export function Badge({ size = 'default', type = 'default' }: BadgeProps){
    const validSize = VALID_SIZES.includes(size as any) ? size : 'default' 
    const validType = VALID_TYPES.includes(type as any) ? type : 'default' 

    return (
       <div className={`${styles.Badge} ${styles[validSize]} ${styles[validType]}`}></div>
    )
}