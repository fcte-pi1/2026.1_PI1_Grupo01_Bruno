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

const safeNum = (val: any) => { const n = Number(val); return isNaN(n) ? 0 : n; };

// ATENÇÃO: Mudei a key para 'displayId' para o usuário ver o número bonito, 
// enquanto o 'id' real oculto será o do Firebase para a lixeira funcionar.
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
    { key: 'duracao', label: 'Duração', icon: 'timer', render: (val) => <p>{Number(val).toFixed(1)}s</p> },
    { key: 'velocity', label: 'Vel. Média', icon: 'speed', render: (val) => <p>{Number(val).toFixed(2)} m/s</p> },
    { key: 'consume', label: 'Consumo', icon: 'electric_bolt', render: (val) => <p>{Number(val).toFixed(0)} mAh</p> },
    { key: 'distance', label: 'Distância', icon: 'route', render: (val) => <p>{Number(val).toFixed(2)} m</p> },
];

export function Dashboard() {
    const navigate = useNavigate();
    const [corridasHistorico, setCorridasHistorico] = useState<any[]>([]);
    const [stats, setStats] = useState({ qtd: 0, sucesso: 0, tempo: '0.0s', vel: '0.00 m/s', consumo: '0.0 Wh' });

    const fetchCorridas = () => {
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const corridas = Object.entries(dadosNode);
                let totalTempo = 0, totalVel = 0, totalConsumo = 0, concluidas = 0;

                const formatoTabela = corridas.map(([firebaseId, corrida]: any, index) => {
                    const ultimaTel = corrida.telemetria ? Object.values(corrida.telemetria).pop() as any : null;
                    
                    
                    const duracao = safeNum(ultimaTel?.tempoMedio);
                    const velocity = safeNum(ultimaTel?.velMedia);
                    const mahRestante = safeNum(ultimaTel?.mah_restante);
                    const consume = mahRestante > 0 ? 1000 - mahRestante : 0;

                    totalTempo += duracao; totalVel += velocity; totalConsumo += consume;
                    if (corrida.metadados?.status === 'concluido') concluidas++;

                    return {
                        id: firebaseId, // O ID real para a lixeira
                        displayId: index + 1, // O ID visual para a tabela
                        datetime: new Date(corrida.metadados?.inicio_timestamp || Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                        size: `${corrida.metadados?.dimensao_labirinto || 16}x${corrida.metadados?.dimensao_labirinto || 16}`,
                        status: corrida.metadados?.status || 'concluido',
                        duracao, velocity, consume, distance: safeNum(ultimaTel?.distancia)
                    };
                });
                
                const total = corridas.length;
                setStats({
                    qtd: total,
                    sucesso: total > 0 ? Math.round((concluidas / total) * 100) : 0,
                    tempo: total > 0 ? (totalTempo / total).toFixed(1) + 's' : '0.0s',
                    vel: total > 0 ? (totalVel / total).toFixed(2) + ' m/s' : '0.00 m/s',
                    consumo: total > 0 ? ((totalConsumo / total) * 0.0084).toFixed(1) + ' Wh' : '0.0 Wh' 
                });

                setCorridasHistorico(formatoTabela.reverse().slice(0, 5)); 
            }).catch(console.error);
    };

    const apagarCorrida = async (param: any) => {
        // Pega o ID com segurança
        const idParaApagar = typeof param === 'object' ? param.id : param;
        if (!idParaApagar) return;
        
        try {
            await axios.delete(`http://localhost:3000/corridas/${idParaApagar}`);
            fetchCorridas(); // Recarrega os dados após deletar
        } catch (error) { 
            console.error("Erro ao apagar:", error); 
        }
    };

    useEffect(() => {
        fetchCorridas(); 
        socket.on('corrida_atualizada', fetchCorridas); 
        return () => { socket.off('corrida_atualizada'); };
    }, []);

    const cardsData = [
        { icon: 'science', label: 'Qtd. Testes', value: stats.qtd.toString(), size: 'lg' as const },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: `${stats.sucesso}%`, size: 'lg' as const },
        { icon: 'timer', label: 'tempo médio', value: stats.tempo, size: 'lg' as const },
        { icon: 'speed', label: 'Vel. média geral', value: stats.vel, size: 'lg' as const },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: stats.consumo, size: 'lg' as const },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms', size: 'default' as const },
        { icon: 'alt_route', label: 'Eficiência de trajeto', value: '70,5%', size: 'default' as const },
        { icon: 'thermostat', label: 'Temp. média do sistema', value: '48°C', size: 'default' as const },
        { icon: 'shield', label: 'Confiabilidade geral', value: '92%', size: 'default' as const },
    ];

    return (
        <div style={{ width: '100%', color: '#FFF' }}>
            <div className={styles.Cards}>
                {cardsData.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
                    </div>    
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Histórico de testes</h3>
                <Button icon='add' label='NOVO PERCURSO' onClick={() => navigate('/percurso')} />
            </div>
            <div style={{ backgroundColor: '#0D0D0D', borderRadius: '12px', border: '1px solid #222', overflowX: 'auto' }}>
                <Table columns={columns as any} data={corridasHistorico} onDelete={apagarCorrida} />
            </div>
        </div>
    );
}