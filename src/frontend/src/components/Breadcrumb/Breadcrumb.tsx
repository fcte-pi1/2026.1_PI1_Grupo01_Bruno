import { useLocation, Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'
import { PAGE_CONFIG } from '../../config/pages'
import type { Page } from '../../types/navigation'

export function Breadcrumb(){
    const { pathname } = useLocation()
    const segments = pathname.split('/').filter(Boolean)

    return (
        <nav className={styles.Breadcrumb}>
            <Link to="/">Dashboard</Link>
            {segments.map((seg: string, i: number) => {
                const path = '/' + segments.slice(0, i + 1).join('/')
                const isLast = i === segments.length - 1
                const label = PAGE_CONFIG[seg as Page]?.label ?? seg
                return isLast
                    ? <span key={path}> &gt; {label}</span>
                    : <span key={path}> &gt; <Link to={path}>{label}</Link></span>
            })}
        </nav>
    )
}