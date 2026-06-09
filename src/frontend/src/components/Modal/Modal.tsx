import styles from './Modal.module.css'
import { Button } from '../Button'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    onConfirm?: () => void
    title: string
    children?: ReactNode
    closeBtn?: boolean
} & (
    | { btnPrimary: true; labelBtnPrimary: string; iconPrimary?: string }
    | { btnPrimary?: false; labelBtnPrimary?: never; iconPrimary?: never }
) & (
    | { btnSecondary: true; labelBtnSecondary: string; iconSecondary?: string }
    | { btnSecondary?: false; labelBtnSecondary?: never; iconSecondary?: never }
) 

export function Modal({
    open, title, onClose, onConfirm, children,
    closeBtn = true,
    btnPrimary, labelBtnPrimary, iconPrimary,
    btnSecondary, labelBtnSecondary, iconSecondary,
}: ModalProps){
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (open) ref.current?.showModal()
        else ref.current?.close()
    }, [open])

    const handleBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === ref.current) onClose()
    }

    return (
        <dialog ref={ref} className={styles.dialog} onClick={handleBackdrop}>
            <header className={styles.header}>
                <h6>{title}</h6>
                {closeBtn && <Button type='circle' hierarchy='tertiary' icon='close' onClick={onClose} />}
            </header>

            <div className={styles.Content}>
                {children}
            </div>

            {(btnPrimary || btnSecondary) &&
                <footer className={styles.footer}>
                    {btnSecondary && <Button label={labelBtnSecondary} {...(iconSecondary ? { icon: iconSecondary } : {})} onClick={onClose} hierarchy='tertiary' />}
                    {btnPrimary && <Button label={labelBtnPrimary} {...(iconPrimary ? { icon: iconPrimary } : {})} onClick={onConfirm} className={styles.BtnFull} />}
                </footer>
            }
        </dialog>
    )
}