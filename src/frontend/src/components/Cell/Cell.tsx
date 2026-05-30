import styles from './Cell.module.css'
import { Trace } from '../Trace'

type Direction = 'left' | 'right' | 'top' | 'bottom'

type CellProps =
    | { wall: true; from?: never; to?: never; visits?: never }
    | { wall?: false; from?: Direction; to?: Direction; visits?: Array<{ from: Direction; to: Direction }> }

function getCell1Side(from?: Direction, to?: Direction) {
    if ((from === 'bottom' && to === 'top') || (from === 'top' && (!to || to === 'bottom')))
        return 'right'
    if ((from === 'left' && (!to || to === 'right')) || (from === 'right' && to === 'left'))
        return 'bottom'
    if ((from === 'left' && to === 'top') || (from === 'top' && to === 'left'))
        return 'bottomRight'
    return undefined
}

function getCell2Side(from?: Direction, to?: Direction) {
    if ((from === 'bottom' && to === 'top') || (from === 'top' && (!to || to === 'bottom')))
        return 'left'
    if ((from === 'right' && (!to || to === 'left')) || (from === 'left' && to === 'right'))
        return 'bottom'
    if ((from === 'right' && to === 'top') || (from === 'top' && to === 'right'))
        return 'bottomLeft'
    return undefined
}

function getCell3Side(from?: Direction, to?: Direction) {
    if ((from === 'bottom' && (!to || to === 'top')))
        return 'right'
    if ((from === 'left' && (!to || to === 'right')) || (from === 'right' && to === 'left'))
        return 'top'
    if ((from === 'left' && to === 'bottom') || (from === 'bottom' && to === 'left'))
        return 'topRight'
    return undefined
}

function getCell4Side(from?: Direction, to?: Direction) {
    if ((from === 'top' && to === 'bottom') || (from === 'bottom' && (!to || to === 'top')))
        return 'left'
    if ((from === 'right' && (!to || to === 'left')) || (from === 'left' && to === 'right'))
        return 'top'
    if ((from === 'right' && to === 'bottom') || (from === 'bottom' && to === 'right'))
        return 'topLeft'
    return undefined
}

type Side = 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight'

function getMultiVisitSides(dirs: Set<Direction>): [Side?, Side?, Side?, Side?] {
    const has = (d: Direction) => dirs.has(d)

    if (has('left') && has('right') && has('top') && has('bottom'))
        return [undefined, 'bottomLeft', 'topRight', undefined]

    if (has('right') && has('left') && has('bottom'))
        return [undefined, undefined, 'topRight', 'topLeft']

    if (has('right') && has('left') && has('top'))
        return ['bottomRight', 'bottomLeft', undefined, undefined]

    if (has('right') && has('top') && has('bottom'))
        return [undefined, 'bottomLeft', undefined, 'topLeft']

    if (has('left') && has('top') && has('bottom'))
        return ['bottomRight', undefined, 'topRight', undefined]

    return [undefined, undefined, undefined, undefined]
}

export function Cell({ from, to, visits, wall=false }: CellProps) {
    if (visits && visits.length > 0) {
        const dirs = new Set<Direction>(visits.flatMap(v => [v.from, v.to]))
        const [s1, s2, s3, s4] = getMultiVisitSides(dirs)
        return (
            <div className={styles.Cell}>
                <Trace side={s1} revisit />
                <Trace side={s2} revisit />
                <Trace side={s3} revisit />
                <Trace side={s4} revisit />
            </div>
        )
    }

    return (
        <div className={`${styles.Cell} ${wall ? styles.Wall : ''}`}>
            {!wall && <>
                <Trace side={getCell1Side(from, to)} />
                <Trace side={getCell2Side(from, to)} />
                <Trace side={getCell3Side(from, to)} />
                <Trace side={getCell4Side(from, to)} />
            </>} 
        </div>
    )
}