import { Table } from '../../components/Table'
import type { Column } from '../../components/Table'
import { Badge } from '../../components/Badge'

const STATUS_BADGE: Record<string, 'success' | 'warn' | 'alert'> = {
  'Concluído': 'success',
  'Falhou':    'alert',
  'Em curso':  'warn',
}

const STATUS_LABEL: Record<string, string> = {
    'concluded': 'Concluído',
    'failed':    'Falhou',
    'running':   'Em curso',
}

// muda aqui os tipos que cada coluna aceita
interface RunData {
    id: number
    datetime: string
    size: '4x4' | '8x8' | '16x16'
    nome: string
    status: 'concluded' | 'failed' | 'running'
    duracao: number
    velocity: number
    consume: number
    distance: number
}

// aqui as colunas escolhidas (as mesmas do banco)
const columns: Column<RunData>[] = [
    { key: 'id', label: 'id', icon: 'tag'},
    { key: 'datetime', label: 'data/hora', icon: 'schedule'},
    { key: 'size', label: 'Tamanho', icon: 'grid_view'},
    { 
        key: 'status',
        label: 'Status',
        render: (value) => {
            const label = STATUS_LABEL[String(value)] ?? String(value)
            const type  = STATUS_BADGE[label] ?? 'default'
            return <Badge size='sm' type={type} label={label} />
        },
        icon: 'task_alt'
    },
    {
        key: 'duracao',
        label: 'Duração',
        icon: 'timer',
        render: (value) => <p>{Number(value).toFixed(1)}s</p>,
    },
    {
        key: 'velocity',
        label: 'Vel. Média',
        icon: 'speed',
        render: (value) => <p>{Number(value).toFixed(2)} m/s</p>,
    },
    {
        key: 'consume',
        label: 'Consumo',
        icon: 'electric_bolt',
        render: (value) => <p>{Number(value).toFixed(2)} Wh</p>,
    },
    {
        key: 'distance',
        label: 'Distância',
        icon: 'route',
        render: (value) => <p>{Number(value).toFixed(2)} m</p>,
    },
]

export function Historico() {

    // aqui os valores que vem do banco
    const data: RunData[] = [
        {
            id: 1,
            datetime: '2026-06-01 14:32',
            size: '8x8',
            nome: 'Percurso A',
            status: 'concluded',
            duracao: 43,
            velocity: 1.25,
            consume: 3.8,
            distance: 53.75,
        },
        {
            id: 2,
            datetime: '2026-06-01 14:40',
            size: '16x16',
            nome: 'Percurso B',
            status: 'failed',
            duracao: 12,
            velocity: 0.92,
            consume: 1.1,
            distance: 11.04,
        },
    ]

    return (
        <div>
            <Table columns={columns} data={data} />
        </div>
    )
}