import styles from './Log.module.css'

interface LogProps {
    entries?: string[]
}

export function Log({ entries = [] }: LogProps){
    return (
        <div className={styles.LogContainer}>
            <div className={styles.Top}>
                <h6>Log de teste</h6>
            </div>
            <div className={styles.LogCenter}>
                {[...entries].reverse().map((entry, i) => (
                    <code key={i}>{entry}</code>
                ))}
            </div>
        </div>
    )
}

// chama assim
{/* <Log entries={[
    '[09:01.105] Conectado',
    '[09:01.200] Conectado ao dispositivo',
    '[09:01.350] Percurso iniciado',
]} /> */}