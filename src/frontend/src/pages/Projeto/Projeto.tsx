import { Badge } from '../../components/Badge'

export function Projeto() {
    return (
        <div>
            <h1>Projeto</h1>
    
            <Badge />
            <Badge size='lg' type='alert' />
            <Badge size='sm' type='success' />
            <Badge type='warn' />

        </div>
    )
}