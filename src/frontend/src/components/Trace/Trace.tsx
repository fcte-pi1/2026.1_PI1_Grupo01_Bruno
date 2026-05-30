import styles from './Trace.module.css'

interface TraceProps {
    side?: 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight' 
    revisit?: boolean
}

const VALID_SIDES = ['left', 'right', 'top', 'bottom', 'topLeft', 'bottomLeft', 'topRight', 'bottomRight']

export function Trace({ side, revisit }: TraceProps){
    const validSide = side && VALID_SIDES.includes(side) ? side : undefined
    return (
        <div className={`${styles.Trace} ${side ? styles[side] : ''}`}>
            { validSide && <div className={`${styles.TraceInner} ${side ? styles[side] : ''} ${revisit ? styles.revisit : ''}`}></div> }
        </div>
    )
}