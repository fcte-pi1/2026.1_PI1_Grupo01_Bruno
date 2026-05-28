import styles from './Trace.module.css'

interface TraceProps {
    side?: 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight' 
    revisit?: boolean
}

export function Trace({ side, revisit }: TraceProps){
    return (
        <div className={`${styles.Trace} ${side ? styles[side] : ''}`}>
            { side && <div className={`${styles.TraceInner} ${side ? styles[side] : ''} ${revisit ? styles.revisit : ''}`}></div> }
        </div>
    )
}