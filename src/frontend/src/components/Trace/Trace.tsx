import styles from './Trace.module.css'

interface TraceProps {
    side?: 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight' 
}

export function Trace({ side }: TraceProps){
    return (
        <div className={`${styles.Trace} ${side ? styles[side] : ''}`}>
            { side && <div className={`${styles.TraceInner} ${side ? styles[side] : ''}`}></div> }
        </div>
    )
}