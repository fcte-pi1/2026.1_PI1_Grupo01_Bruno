import styles from './BottomBar.module.css'
import { Tab } from '../Tab'
import type { Page } from '../../types/navigation'

interface BottomBarProps {
    currentPage?: Page
    onPageChange?: (page: Page) => void
}

const TABS: { page: Page; label: string; icon: string }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { page: 'historico', label: 'Histórico', icon: 'history' },
    { page: 'projeto', label: 'Projeto', icon: 'architecture' },
    { page: 'equipe', label: 'Equipe', icon: 'groups' },
    { page: 'chassi', label: 'Chassi', icon: 'view_in_ar' },
]

export function BottomBar({ currentPage, onPageChange }: BottomBarProps){
    return (
       <nav className={styles.bottomBar}>
            {TABS.map(({ page, label, icon }) => (
                <Tab
                    key={page}
                    label={label}
                    icon={icon}
                    isActive={currentPage === page}
                    isBottom
                    onClick={() => onPageChange?.(page)}
                />
            ))}
        </nav> 
    )
}