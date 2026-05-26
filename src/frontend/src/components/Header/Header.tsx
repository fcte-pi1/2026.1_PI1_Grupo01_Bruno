import styles from './Header.module.css'
import { Button } from '../Button'
import { Tab } from '../Tab'
import { Logo } from '../Logo'

type Page = 'dashboard' | 'historico' | 'projeto' | 'equipe'

interface HeaderProps {
    size?: '12column' | '8column' | '4column'
    currentPage?: Page
    onPageChange?: (page:Page) => void
    onThemeToggle?: () => void

}

const TABS: {page: Page; label: string; icon: string}[] = [
    {page: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
    {page: 'historico', label: 'historico', icon: 'history'},
    {page: 'projeto', label: 'projeto', icon: 'folder_open'},
    {page: 'equipe', label: 'equipe', icon: 'group'},
]

export function Header({ size = '12column', currentPage = 'dashboard', onPageChange, onThemeToggle}: HeaderProps){
    const logoSize = size === '12column' ? 'lg' : size === '8column' ? 'md' : 'sm'

    return (
        <header className={`${styles.header} ${styles[size]}`}>
            <Logo size={logoSize} />
            
            {size !== '4column' && (
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
            )}

            <Button
                type="circle"
                icon="brightness_medium"
                density="default"
                hierarchy="tertiary"
                onClick={onThemeToggle}
            />
        </header>
    )
}