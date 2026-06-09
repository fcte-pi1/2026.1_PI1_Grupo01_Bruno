import styles from './Maze.module.css'
import { Cell } from '../Cell'
import { useMemo } from 'react'

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

export function Maze({ size = 4, updates = [], path = [] }: MazeProps){
    const gridSize = size * 2 + 1
    const totalCells = gridSize * gridSize

    const cells = useMemo(() => {
        const base = Array.from({ length: totalCells }, (_, i) => {
            const col = i % gridSize;
            const row = Math.floor(i / gridSize);
            const isNavCell = row % 2 !== 0 && col % 2 !== 0;
            return { wall: !isNavCell, unknown: true };
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
        return base
    }, [updates, size, gridSize, totalCells]);

    const getCellCenter = (navIndex: number) => {
        const gridIdx = navToGrid(navIndex, size);
        const col = gridIdx % gridSize;
        const row = Math.floor(gridIdx / gridSize);
        return {
            x: (col + 0.5) * (100 / gridSize),
            y: (row + 0.5) * (100 / gridSize)
        };
    };

    const svgLines = [];
    const svgJoints = [];
    const visitedEdges = new Set<string>();

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const edgeId = [p1, p2].sort().join('-'); 
        
        const isRevisit = visitedEdges.has(edgeId);
        visitedEdges.add(edgeId);

        const { x: x1, y: y1 } = getCellCenter(p1);
        const { x: x2, y: y2 } = getCellCenter(p2);
        
        const color = isRevisit ? 'var(--logo-secondary)' : 'var(--txt-interaction)';

        // Cria a linha reta
        svgLines.push(
            <line
                key={`line-${i}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                stroke={color} strokeWidth="2.5%" 
            />
        );

        // Cria um pequeno círculo nas quinas para corrigir o "buraco" no cotovelo
        svgJoints.push(
            <circle key={`joint-${i}`} cx={`${x2}%`} cy={`${y2}%`} r="1.25%" fill={color} />
        );
        
        // Pinta a junta inicial
        if (i === 0) {
            svgJoints.push(<circle key="joint-start" cx={`${x1}%`} cy={`${y1}%`} r="1.25%" fill={color} />);
        }
    }

    const currentPos = path.length > 0 ? path[path.length - 1] : undefined;

    return (
        <div className={styles.MazeBox} style={{ position: 'relative' }}>
            <div
                className={`${styles.Maze} ${styles[`size${size}`]}`}
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                }}
            >
                {cells.map((cell, i) => (
                    <Cell key={i} wall={cell.wall} unknown={cell.unknown} />
                ))}
            </div>

            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
                {svgLines}
                {svgJoints}
                {currentPos !== undefined && (
                    <circle cx={`${getCellCenter(currentPos).x}%`} cy={`${getCellCenter(currentPos).y}%`} r="1.8%" fill="var(--mouse)" />
                )}
            </svg>
        </div>
    )
}