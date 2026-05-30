import styles from './ControlBtn.module.css'
import { useState } from 'react'
import { Button } from '../Button'

type ControlState = 'idle' | 'running' | 'paused'

interface ControlBtnProps {
    onStart?: () => void
    onPause?: () => void
    onResume?: () => void
    onCancel?: () => void
    onRestart?: () => void
}

export function ControlBtn({ 
    onStart,
    onPause,
    onResume,
    onCancel,
    onRestart,
}: ControlBtnProps){
    const [state, setState] = useState<ControlState>('idle')
    
    const handle = (action: () => void, next: ControlState) => {
        action()
        setState(next)
    }

    if (state === 'idle') return (
        <div className={styles.buttons}>
            <Button
                label="Iniciar Percurso"
                icon="play_arrow"
                onClick={() => handle(onStart ?? (() => {}), 'running')}
            />
        </div>
    )

    if (state === 'running') return (
        <div className={styles.buttons}>
            <Button
                label="Pausar"
                icon="pause"
                hierarchy="primary"
                onClick={() => handle(onPause ?? (() => {}), 'paused')}
            />
            <Button
                label="Cancelar"
                icon="stop"
                hierarchy="secondary"
                onClick={() => handle(onCancel ?? (() => {}), 'idle')}
            />
            <Button
                label="Reiniciar"
                icon="undo"
                hierarchy="tertiary"
                onClick={() => handle(onRestart ?? (() => {}), 'running')}
            />
        </div>
    )

    if (state === 'paused') return (
        <div className={styles.buttons}>
            <Button
                label="Retomar"
                icon="play_arrow"
                hierarchy="primary"
                onClick={() => handle(onResume ?? (() => {}), 'running')}
            />
            <Button
                label="Cancelar"
                icon="stop"
                hierarchy="secondary"
                onClick={() => handle(onCancel ?? (() => {}), 'idle')}
            />
            <Button
                label="Reiniciar"
                icon="undo"
                hierarchy="tertiary"
                onClick={() => handle(onRestart ?? (() => {}), 'running')}
            />
        </div>
    )
}