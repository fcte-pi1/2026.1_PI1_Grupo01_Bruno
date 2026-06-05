import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';
import { Badge } from '../../components/Badge';

const STATUS_BADGE: Record<string, 'success' | 'warn' | 'alert'> = {
  'Concluído': 'success', 'Falhou': 'alert', 'Em curso': 'warn',
};
const STATUS_LABEL: Record<string, string> = {
    'concluido': 'Concluído', 'falha': 'Falhou', 'interrompida': 'Falhou', 'em_execucao': 'Em curso',
};

const safeNum = (val: any) => { const n = Number(val); return isNaN(n) ? 0 : n; };

const columns: Column<any>[] = [
    { key: 'displayId', label: 'id', icon: 'tag'},
    { key: 'datetime', label: 'data/hora', icon: 'schedule'},
    { key: 'size', label: 'Tamanho', icon: 'grid_view'},
    { 
        key: 'status', label: 'Status', icon: 'task_alt',
        render: (value) => {
            const label = STATUS_LABEL[String(value).toLowerCase()] ?? 'Desconhecido';
            const type  = STATUS_BADGE[label] ?? 'default';
            return <Badge size='sm' type={type} label={label} />;
        }
    },
    { key: 'duracao', label: 'Duração', icon: 'timer', render: (value) => <p>{Number(value).toFixed(1)}s</p> },
    { key: 'velocity', label: 'Vel. Média', icon: 'speed', render: (value) => <p>{Number(value).toFixed(2)} m/s</p> },
    { key: 'consume', label: 'Consumo', icon: 'electric_bolt', render: (value) => <p>{Number(value).toFixed(0)} mAh</p> },
    { key: 'distance', label: 'Distância', icon: 'route', render: (value) => <p>{Number(value).toFixed(2)} m</p> },
];

export function Historico() {
    const [data, setData] = useState<any[]>([]);

    const fetchCorridas = () => {
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const listaCorridas = Object.entries(dadosNode);
                const formatoTabela = listaCorridas.map(([firebaseId, corrida]: any, index) => {
                    const ultimaTel = corrida.telemetria ? Object.values(corrida.telemetria).pop() as any : null;
                    const mahRestante = safeNum(ultimaTel?.mah_restante);
                    return {
                        id: firebaseId, // ID real para deletar
                        displayId: index + 1, // ID visual da tabela
                        datetime: new Date(corrida.metadados?.inicio_timestamp || Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                        size: `${corrida.metadados?.dimensao_labirinto || 16}x${corrida.metadados?.dimensao_labirinto || 16}` as any,
                        status: corrida.metadados?.status || 'concluido',
                        duracao: safeNum(ultimaTel?.tempoMedio),
                        velocity: safeNum(ultimaTel?.velMedia),
                        consume: mahRestante > 0 ? 1000 - mahRestante : 0, 
                        distance: safeNum(ultimaTel?.distancia)
                    };
                });
                setData(formatoTabela.reverse()); 
            }).catch(console.error);
    };

    useEffect(() => { fetchCorridas(); }, []);

   const apagarCorrida = async (param: any) => {
        console.log('O botão foi clicado!', param);
        
        const idParaApagar = typeof param === 'object' ? param.id : param;
        console.log('O ID extraído é:', idParaApagar);
        
        if (!idParaApagar) {
            console.error('ERRO: O ID está vazio!');
            return;
        }
        
        try {
            console.log(`Enviando ordem para apagar a corrida: ${idParaApagar}`);
            const response = await axios.delete(`http://localhost:3000/corridas/${idParaApagar}`);
            console.log('Back-end respondeu:', response.data);
            
            fetchCorridas(); 
        } catch (error) { 
            console.error(" Deu erro na API:", error); 
        }
    };

    return (
        <div style={{ width: '100%', color: '#FFF' }}>
            <div style={{ backgroundColor: '#0D0D0D', borderRadius: '12px', border: '1px solid #222', overflowX: 'auto' }}>
                <Table columns={columns} data={data} onDelete={apagarCorrida} />
            </div>
        </div>
    );
}