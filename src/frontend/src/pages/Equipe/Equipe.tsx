import styles from './Equipe.module.css'
import { Cell } from '../../components/Cell'

export function Equipe() {
    return (
        <div className={styles.Content}>
            <h1>Equipe</h1>
            <h2>from: left</h2>
            <Cell from="left" />

            <h2>from: right</h2>
            <Cell from="right" />

            <h2>from: top</h2>
            <Cell from="top" />

            <h2>from: bottom</h2>
            <Cell from="bottom" />

            <h2>from: left to: right</h2>
            <Cell from="left" to="right" />

            <h2>from: left to: top</h2>
            <Cell from="bottom" to="right" />
            <Cell from="left" to="top" />

            <h2>from: left to: bottom</h2>
            <Cell from="left" to="bottom" />

            <h2>from: right to: top</h2>
            <Cell from="right" to="top" />

            <h2>from: right to: bottom</h2>
            <Cell from="right" to="bottom" />

            <h2>from: top to: bottom</h2>
            <Cell from="top" to="bottom" />

            <h2>empty</h2>
            <Cell />
            
            <h2>right bottom left</h2>
            <Cell visits={[{ from: 'right', to: 'bottom' }, { from: 'bottom', to: 'left' }]} />

            <h2>right left bottom top</h2>
            <Cell visits={[{ from: 'right', to: 'left' }, { from: 'top', to: 'bottom' }, { from: 'left', to: 'top' }]} />
        </div>
    )
}