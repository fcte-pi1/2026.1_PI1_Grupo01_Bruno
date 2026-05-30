import { ControlBtn } from '../../components/ControlBtn'
import { Maze } from '../../components/Maze'

export function Historico() {
    return (
        <div>
            <h1>Histórico</h1>

            <ControlBtn
            />

            <Maze />

            <br />

            <Maze size={8} />
            <br />

            <Maze size={16} />
        </div>
    )
}