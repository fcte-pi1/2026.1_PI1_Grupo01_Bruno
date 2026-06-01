import { ControlBtn } from '../../components/ControlBtn'
import { Maze } from '../../components/Maze'

export function Historico() {
    return (
        <div>
            <h1>Histórico</h1>

            <ControlBtn
            />
            
            <Maze  size={4} updates={ [
                { index: 0, walls: { left: true, right: false, top: true, bottom: true } },
                {index: 1, walls: { left: false, right: false, top: true, bottom: false} },
                {index: 5, walls: { left: true, right: false, top: false, bottom: false } },
                {index: 9, walls: { left: true, right: false, top: false, bottom: true} },
                {index: 10, walls: { left: false, right: true, top: false, bottom: true} },
                {index: 6, walls: { left: false, right: true, top: true, bottom: false } }
            ]}
            path={[0, 1, 5, 9, 10, 6]}/>

            <br />

            <Maze size={8} />
            <br />

            <Maze size={16} />
        </div>
    )
}