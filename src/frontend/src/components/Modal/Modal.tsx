import styles from './Modal.module.css'
import { Button } from '../Button'
import type { ReactNode } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
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
    open, title, onClose, children,
    closeBtn = true,
    btnPrimary, labelBtnPrimary, iconPrimary,
    btnSecondary, labelBtnSecondary, iconSecondary,
}: ModalProps){
    return (
        <dialog open={open}>
            <header>
                <h6>{title}</h6>
                {closeBtn && <Button type='circle' hierarchy='tertiary' icon='close' onClick={onClose} />}
            </header>

            <div className={styles.Content}>
                {children}
            </div>

            {(btnPrimary || btnSecondary) &&
                <footer>
                    {btnPrimary && <Button label={labelBtnPrimary} {...(iconPrimary ? { icon: iconPrimary } : {})} className={styles.BtnFull} />}
                    {btnSecondary && <Button label={labelBtnSecondary} {...(iconSecondary ? { icon: iconSecondary } : {})} hierarchy='tertiary' />}
                </footer>
            }
        </dialog>
    )
}