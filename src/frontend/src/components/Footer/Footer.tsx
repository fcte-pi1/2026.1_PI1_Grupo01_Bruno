import styles from './Footer.module.css'
import type { Page } from '../../types/navigation'
import { Logo } from '../Logo'


interface FooterProps {
    currentPage?: Page
    onPageChange?: (page:Page) => void
    githubUrl?: string
}

const CURRENT_YEAR = new Date().getFullYear()

function GitHubIcon() {
    return (
        <svg>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.8125 37.375C22.8125 37.5 22.6875 37.5625 22.5 37.5625C22.3125 37.625 22.1875 37.5 22.1875 37.375C22.1875 37.25 22.3125 37.125 22.5 37.125C22.6875 37.125 22.8125 37.25 22.8125 37.375ZM20.875 37.0625C20.9375 36.9375 21.125 36.875 21.3125 36.9375C21.5 37 21.5625 37.125 21.5625 37.25C21.5 37.375 21.3125 37.4375 21.1875 37.375C21 37.375 20.875 37.1875 20.875 37.0625ZM23.6875 37C23.8125 36.9375 24 37.0625 24 37.1875C24.0625 37.3125 23.9375 37.375 23.75 37.4375C23.5625 37.5 23.375 37.4375 23.375 37.3125C23.375 37.125 23.5 37 23.6875 37ZM27.75 13C36.4375 13 43.5 19.625 43.5 28.25C43.5 35.1875 39.25 41.125 33 43.1875C32.1875 43.375 31.875 42.875 31.875 42.4375C31.875 41.9375 31.9375 39.3125 31.9375 37.25C31.9375 35.75 31.4375 34.8125 30.875 34.3125C34.375 33.9375 38.0625 33.4375 38.0625 27.4375C38.0625 25.6875 37.4375 24.875 36.4375 23.75C36.5625 23.3125 37.125 21.6875 36.25 19.5C34.9375 19.0625 31.9375 21.1875 31.9375 21.1875C30.6875 20.8125 29.375 20.6875 28 20.6875C26.6875 20.6875 25.375 20.8125 24.125 21.1875C24.125 21.1875 21.0625 19.125 19.8125 19.5C18.9375 21.6875 19.4375 23.3125 19.625 23.75C18.625 24.875 18.125 25.6875 18.125 27.4375C18.125 33.4375 21.6875 33.9375 25.1875 34.3125C24.6875 34.75 24.3125 35.4375 24.1875 36.4375C23.25 36.875 21 37.5625 19.625 35.125C18.75 33.625 17.1875 33.5 17.1875 33.5C15.6875 33.5 17.125 34.5 17.125 34.5C18.125 34.9375 18.8125 36.75 18.8125 36.75C19.75 39.5625 24.125 38.625 24.125 38.625C24.125 39.9375 24.125 42.0625 24.125 42.5C24.125 42.875 23.875 43.375 23.0625 43.25C16.8125 41.125 12.5 35.1875 12.5 28.25C12.5 19.625 19.125 13 27.75 13ZM18.5625 34.5625C18.625 34.5 18.75 34.5625 18.875 34.625C19 34.75 19 34.9375 18.9375 35C18.8125 35.0625 18.6875 35 18.5625 34.9375C18.5 34.8125 18.4375 34.625 18.5625 34.5625ZM17.875 34.0625C17.9375 34 18 34 18.125 34.0625C18.25 34.125 18.3125 34.1875 18.3125 34.25C18.25 34.375 18.125 34.375 18 34.3125C17.875 34.25 17.8125 34.1875 17.875 34.0625ZM19.875 36.3125C20 36.1875 20.1875 36.25 20.3125 36.375C20.4375 36.5 20.4375 36.6875 20.375 36.75C20.3125 36.875 20.125 36.8125 20 36.6875C19.8125 36.5625 19.8125 36.375 19.875 36.3125ZM19.1875 35.375C19.3125 35.3125 19.4375 35.375 19.5625 35.5C19.625 35.625 19.625 35.8125 19.5625 35.875C19.4375 35.9375 19.3125 35.875 19.1875 35.75C19.0625 35.625 19.0625 35.4375 19.1875 35.375Z"
            fill="var(--logo)"
            />
            </svg>


        </svg>
    )
}

export function Footer({githubUrl = 'https://github.com'}: FooterProps){
    return(
        <footer className={styles.footer}>
        <div className={styles.grid}>
            <div className={styles.colLinks}>
                <div className={styles.sectionLabel}><h4>LINKS</h4>
                    <a href="/inicio">
                        <p>Início</p>
                    </a>
                     <a href="/dashboard">
                        <p>dashboard</p>
                    </a>
                    <a href="/historico">
                        <p>Histórico</p>
                    </a>
                    <a href="/equipe">
                        <p>Equipe</p>
                    </a>
                </div>
            </div>

            <div className={styles.colBrand}>
                <Logo size="md" />
                <p className={styles.tagline}>
                    Micromouse&nbsp;|&nbsp;Inteligência&nbsp;|&nbsp;Inovação
                </p>
                <p className={styles.taglineSub}>
                    Universidade de Brasília
                </p>
                <p className={styles.copyright}>
                    @{CURRENT_YEAR} XAROPi. Todos os direitos reservados.
                </p>
            </div>
            <div className={styles.colSocial}>
                <span className={styles.sectionLabel}>Acompanhe</span>
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubBtn}
                    aria-label="Github do projeto XAROPi"
                >
                    <GitHubIcon />
                </a>
            </div>
        </div>
    </footer>
    )
}