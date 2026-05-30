import styles from './Maze.module.css'
import { Cell } from '../Cell'
import { useState } from 'react'

type Direction = 'left' | 'right' | 'top' | 'bottom' 

type CellData = 
    | { wall : true}
    | { wall?: false; from?: Direction; to?: Direction; visits?: Array<{from: Direction; to: Direction }> }
    
interface MazeProps {
    size?: 4 | 8 | 16
}


export function Maze({ size = 4 }: MazeProps){
    const gridSize = size * 2 + 1
    const totalCells = gridSize * gridSize

    // const está apenas simulando o backend
    const [cells, setCells] = useState<CellData[]>(
        Array.from({ length: totalCells }, (_, i) => {
            if (i % 2 === 0 && i % (gridSize * 2) < gridSize) return { wall: true }
            
            const patterns: CellData[] = [
                { from: 'left', to: 'right' },
                { from: 'top', to: 'bottom' },
                { from: 'left', to: 'top' },
                { from: 'left', to: 'bottom' },
                { from: 'right', to: 'top' },
                { from: 'right', to: 'top' },
                { from: 'left' },
                { from: 'right' },
                { from: 'top' },
                { from: 'bottom' },
                {}
            ]
            return patterns[i % patterns.length]
        })
    )

    return (
        <div className={styles.MazeBox}>
            <div
                className={`${styles.Maze} ${styles[`size${size}`]}`}
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                    fontSize: size === 4 ? '12px' : size === 8 ? '8px' : '4px'
                }}
            >
                {cells.map((cell, i) => (
                    <Cell key={i} {...cell} />
                ))}
            </div>
        </div>
    )
}