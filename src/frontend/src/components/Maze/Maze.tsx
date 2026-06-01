import styles from './Maze.module.css'
import { Cell } from '../Cell'
import { useMemo} from 'react'

type Direction = 'left' | 'right' | 'top' | 'bottom' 

type CellData = {
    wall?: boolean;
    unknown?: boolean;
    from?: Direction;
    to?: Direction;
    visits?: Array<{ from?: Direction; to?: Direction }>;
}
interface CellUpdate {
    index: number;
    walls:{left: boolean; right: boolean; top: boolean; bottom: boolean};
}
interface MazeProps {
    size?: 4 | 8 | 16
    updates?: CellUpdate[];
    path?: number[];
}

function navToGrid(navIndex: number, size: number){
    const gridSize = size * 2 + 1
    const col = navIndex % size
    const row = Math.floor(navIndex / size)
    return (row * 2 + 1) * gridSize + (col * 2 + 1)
}

function getDir(fromNav: number, toNav: number, size: number): Direction{
    if (toNav === fromNav - 1) return 'left'
    if (toNav === fromNav + 1) return 'right'
    if (toNav === fromNav - size) return 'top'
    return 'bottom'
}

function invertDir(dir: Direction): Direction {
    const opposites: Record<Direction, Direction> = {left: 'right', right: 'left', top: 'bottom', bottom: 'top'}
    return opposites[dir]
}
export function Maze({ size = 4, updates = [], path = [] }: MazeProps){
    const gridSize = size * 2 + 1
    const totalCells = gridSize * gridSize

    const cells = useMemo<CellData[]>(() => {
        const base: CellData[] = Array.from({ length: totalCells }, (_, i) => {
            const col = i % gridSize;
            const row = Math.floor(i / gridSize);
            const isNavCell = row % 2 !== 0 && col % 2 !== 0;
            
            return {
                wall: !isNavCell, 
                unknown: true     
            };
        });

        for (const update of updates) {
            const gridIndex = navToGrid(update.index, size)
            
            base[gridIndex].wall = false
            base[gridIndex].unknown = false
            base[gridIndex - 1].wall = update.walls.left
            base[gridIndex - 1].unknown = false
            base[gridIndex + 1].wall = update.walls.right
            base[gridIndex + 1].unknown = false
            base[gridIndex - gridSize].wall = update.walls.top
            base[gridIndex - gridSize].unknown = false
            base[gridIndex + gridSize].wall = update.walls.bottom
            base[gridIndex + gridSize].unknown = false
            base[gridIndex - gridSize - 1].unknown = false
            base[gridIndex - gridSize + 1].unknown = false
            base[gridIndex + gridSize - 1].unknown = false
            base[gridIndex + gridSize + 1].unknown = false
        }

        for (let r = 0; r < gridSize; r += 2) {
            for (let c = 0; c < gridSize; c += 2) {
                const pillarIdx = r * gridSize + c
                
                const wallTop = r > 0 ? base[pillarIdx - gridSize].wall : false
                const wallBottom = r < gridSize - 1 ? base[pillarIdx + gridSize].wall : false
                const wallLeft = c > 0 ? base[pillarIdx - 1].wall : false
                const wallRight = c < gridSize - 1 ? base[pillarIdx + 1].wall : false

                base[pillarIdx].wall = wallTop || wallBottom || wallLeft || wallRight
            }
        }

        const pathVisits = new Map<number, Array<{ from?: Direction, to?: Direction }>>()

        for (let i = 0; i < path.length; i++) {
            const curr = path[i];
            const prev = path[i - 1]
            const next = path[i + 1]

            const gridIdx = navToGrid(curr, size);
            const fromDir = prev !== undefined ? invertDir(getDir(prev, curr, size)) : undefined
            const toDir = next !== undefined ? getDir(curr, next, size) : undefined

            if (!pathVisits.has(gridIdx)) pathVisits.set(gridIdx, []);
            pathVisits.get(gridIdx)!.push({ from: fromDir, to: toDir })

            if (next !== undefined && toDir) {
                const doorOffset = toDir === 'left' ? -1 : toDir === 'right' ? 1 : toDir === 'top' ? -gridSize : gridSize
                const doorIdx = gridIdx + doorOffset
                
                if (!pathVisits.has(doorIdx)) pathVisits.set(doorIdx, []);
                pathVisits.get(doorIdx)!.push({ from: invertDir(toDir), to: toDir })
            }
        }

        pathVisits.forEach((visits, idx) => {
            if (visits.length) {
                base[idx].from = visits[0].from
                base[idx].to = visits[0].to
            } else if (visits.length > 1) {
                base[idx].visits = visits
            }
        });

        return base
    }, [updates, path, size, gridSize, totalCells]);

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