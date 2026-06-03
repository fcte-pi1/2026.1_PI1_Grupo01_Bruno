import styles from './Header.module.css'
import { Button } from '../Button'
import { Tab } from '../Tab'
import { Logo } from '../Logo'
import type { Page } from '../../types/navigation'

interface HeaderProps {
    currentPage?: Page
    onPageChange?: (page:Page) => void
    onThemeToggle?: () => void
    theme?: 'light' | 'dark'

}

const TABS: {page: Page; label: string; icon: string}[] = [
    {page: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
    {page: 'historico', label: 'Histórico', icon: 'history'},
    {page: 'projeto', label: 'Projeto', icon: 'architecture'},
    {page: 'equipe', label: 'Equipe', icon: 'group'},
    {page: 'chassi', label: 'Chassi', icon: 'view_in_ar'},
]

export function Header({ currentPage = 'dashboard', onPageChange, onThemeToggle, theme = 'dark'}: HeaderProps){
    const themeIcon = theme === 'dark' ? 'light_mode' : 'dark_mode'

    return (
        <header className={`${styles.header}`}>
            <button
                className={styles.logoBtn}
                onClick={() => onPageChange?.('dashboard')}
                aria-label="Ir para o dashboard"
                >
                <Logo />
            </button>
        
            <nav className={styles.nav} arial-label="Navegação principal">
                {TABS.map(({ page, label, icon}) => (
                    <Tab
                        key={page}
                        label={label}
                        icon={icon}
                        isActive={currentPage === page}
                        onClick={() => onPageChange?.(page)}
                    />
                ))}
            </nav>

            <Button
                type="circle"
                icon={themeIcon}
                density="default"
                hierarchy="tertiary"
                onClick={onThemeToggle}
            />
        </header>
    )
}