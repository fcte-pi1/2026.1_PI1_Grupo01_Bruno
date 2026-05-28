import styles from './Maze.module.css'
import { Cell } from '../Cell'

interface MazeProps {
    size: '4' | '8' | '16'
}

const TABS: {page: Page; label: string; icon: string}[] = [
    {page: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
    {page: 'historico', label: 'Histórico', icon: 'history'},
    {page: 'projeto', label: 'Projeto', icon: 'architecture'},
    {page: 'equipe', label: 'Equipe', icon: 'group'},
]

export function Maze({ size = '8' }: MazeProps){
    return (
        <div className={}>

        </div>
    )
}