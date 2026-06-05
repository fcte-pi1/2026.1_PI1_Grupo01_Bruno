import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { socket } from '../../socket';
import styles from './Dashboard.module.css';

const STATUS_BADGE: Record<string, 'success' | 'warn' | 'alert'> = {
    'Concluído': 'success', 'Falhou': 'alert', 'Em curso': 'warn'
};
const STATUS_LABEL: Record<string, string> = {
    'concluido': 'Concluído', 'falha': 'Falhou', 'interrompida': 'Falhou', 'em_execucao': 'Em curso'
};

const columns: Column<any>[] = [
    { key: 'id', label: 'id', icon: 'tag'},
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
    { key: 'duracao', label: 'Duração', icon: 'timer', render: (val) => <p>{Number(val).toFixed(1)}s</p> },
    { key: 'velocity', label: 'Vel. Média', icon: 'speed', render: (val) => <p>{Number(val).toFixed(2)} m/s</p> },
    { key: 'consume', label: 'Consumo', icon: 'electric_bolt', render: (val) => <p>{Number(val).toFixed(0)} mAh</p> },
    { key: 'distance', label: 'Distância', icon: 'route', render: (val) => <p>{Number(val).toFixed(2)} m</p> },
];

export function Dashboard() {
    const navigate = useNavigate();
    const [qtdTestes, setQtdTestes] = useState(0);
    const [taxaSucesso, setTaxaSucesso] = useState(0);
    const [corridasHistorico, setCorridasHistorico] = useState<any[]>([]);

    const fetchCorridas = () => {
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const listaCorridas = Object.values(dadosNode) as any[];
                setQtdTestes(listaCorridas.length);

                const concluidas = listaCorridas.filter(corrida => corrida.metadados?.status === 'concluido').length;
                setTaxaSucesso(listaCorridas.length > 0 ? Math.round((concluidas / listaCorridas.length) * 100) : 0);

                const formatoTabela = listaCorridas.map((corrida, index) => {
                    const ultimaTel = corrida.telemetria ? Object.values(corrida.telemetria).pop() as any : null;
                    return {
                        id: index + 1,
                        datetime: new Date(corrida.metadados?.inicio_timestamp || Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                        size: `${corrida.metadados?.dimensao_labirinto || 16}x${corrida.metadados?.dimensao_labirinto || 16}`,
                        status: corrida.metadados?.status || 'concluido',
                        duracao: ultimaTel?.tempoMedio || 0,
                        velocity: ultimaTel?.velMedia || 0,
                        consume: 1000 - (ultimaTel?.mah_restante || 1000),
                        distance: ultimaTel?.distancia || 0
                    };
                });
                
                // Exibe apenas as últimas 5 no Dashboard
                setCorridasHistorico(formatoTabela.reverse().slice(0, 5)); 
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchCorridas(); 
        socket.on('corrida_atualizada', fetchCorridas); 
        return () => { socket.off('corrida_atualizada'); };
    }, []);

    const stats = [
        { icon: 'science', label: 'Qtd. Testes', value: qtdTestes.toString(), size: 'lg' as const },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: `${taxaSucesso}%`, size: 'lg' as const },
        { icon: 'timer', label: 'tempo médio', value: '43.3s', size: 'lg' as const },
        { icon: 'speed', label: 'Vel. média geral', value: '0.38 m/s', size: 'lg' as const },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: '3.8 Wh', size: 'lg' as const },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms', size: 'default' as const },
        { icon: 'alt_route', label: 'Eficiência de trajeto', value: '70,5%', size: 'default' as const },
        { icon: 'thermostat', label: 'Temp. média do sistema', value: '48°C', size: 'default' as const },
        { icon: 'shield', label: 'Confiabilidade geral', value: '92%', size: 'default' as const },
    ];

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', color: '#FFF' }}>
            <div className={styles.Cards}>
                {stats.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
                    </div>    
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase' }}>Histórico de testes</h3>
                <Button icon='add' label='NOVO PERCURSO' onClick={() => navigate('/percurso')} />
            </div>

            <Table columns={columns as any} data={corridasHistorico} />
        </div>
    );
}