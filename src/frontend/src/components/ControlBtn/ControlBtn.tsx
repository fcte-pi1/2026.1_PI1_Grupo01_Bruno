import styles from './ControlBtn.module.css'
import { useState } from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'

type ControlState = 'idle' | 'running' | 'paused'
type PendingAction = 'cancel' | 'restart' | null

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
    const [pending, setPending] = useState<PendingAction>(null)
    
    const handle = (action: () => void, next: ControlState) => {
        action()
        setState(next)
    }

    const confirm = (action: PendingAction) => setPending(action)

    const handleConfirm = () => {
        if (pending === 'cancel') handle(onCancel ?? (() => {}), 'idle')
        if (pending === 'restart') handle(onRestart ?? (() => {}), 'running')
        setPending(null)
    }

    const modalConfig = {
        cancel: {
            title: 'Cancelar percurso',
            message: 'Deseja cancelar percurso? O progresso será perdido.',
            label: 'Cancelar percurso',
        },
        restart: {
            title: 'Reiniciar percurso',
            message: 'Deseja reiniciar o percurso? O progresso atual será perdido.',
            label: 'Reiniciar',
        }
    }

    const config = pending ? modalConfig[pending] : null

    return (
        <>
            {config && (
                <Modal
                    open={!!pending}
                    title={config.title}
                    onClose={() => setPending(null)}
                    onConfirm={handleConfirm}
                    btnPrimary
                    labelBtnPrimary={config.label}
                    btnSecondary 
                    labelBtnSecondary="Voltar" 
                >
                    <p>{config.message}</p>
                </Modal>
            )}

            {state === 'idle' && (
                <div className={styles.buttons}>
                    <Button
                        label="Iniciar Percurso"
                        icon="play_arrow"
                        onClick={() => handle(onStart ?? (() => {}), 'running')} 
                    />
                </div>
            )}

            {state === 'running' && (
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
                        onClick={() => confirm('cancel')} 
                    />
                    <Button
                        label="Reiniciar"
                        icon="undo"
                        hierarchy="tertiary"
                        onClick={() => confirm('restart')} 
                    />
                </div>
            )}

            {state === 'paused' && (
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
                        onClick={() => confirm('cancel')} 
                    />
                    <Button
                        label="Reiniciar"
                        icon="undo"
                        hierarchy="tertiary"
                        onClick={() => confirm('restart')} 
                    />
                </div>
            )}
        </>
    )

}