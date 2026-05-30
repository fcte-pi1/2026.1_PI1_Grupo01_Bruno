import { useLocation, Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

const LABELS: Record<string, string> = {
    historico: 'Histórico',
    projeto: 'Projeto',
    equipe: 'Equipe',
}

export function Breadcrumb(){
    const { pathname } = useLocation()
    const segments = pathname.split('/').filter(Boolean)

    return (
        <nav className={styles.Breadcrumb}>
            <Link to="/">Dashboard</Link>
            {segments.map((seg: string, i: number) => {
                const path = '/' + segments.slice(0, i + 1).join('/')
                const isLast = i === segments.length - 1
                return isLast
                    ? <span key={path}> &gt; {LABELS[seg] ?? seg}</span>
                    : <span key={path}> &gt; <Link to={path}>{LABELS[seg] ?? seg}</Link></span>
            })}
        </nav>
    )
}