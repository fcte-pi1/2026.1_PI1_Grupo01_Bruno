import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import styles from './Dashboard.module.css';

const socket = io('http://localhost:3000');

export function Dashboard() {
    const navigate = useNavigate();

    const [qtdTestes, setQtdTestes] = useState(0);
    const [taxaSucesso, setTaxaSucesso] = useState(0);
    const [corridasHistorico, setCorridasHistorico] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const listaCorridas = Object.values(dadosNode) as any[];
                setQtdTestes(listaCorridas.length);

                const concluidas = listaCorridas.filter(corrida => corrida.metadados?.status === 'concluido').length;
                const porcentagemSucesso = listaCorridas.length > 0 
                    ? Math.round((concluidas / listaCorridas.length) * 100) 
                    : 0;
                setTaxaSucesso(porcentagemSucesso);

                const formatoTabela = listaCorridas.map((corrida, index) => {
                    const idOriginal = Object.keys(dadosNode)[index];
                    const ultimaTel = corrida.telemetria ? (Object.values(corrida.telemetria).pop() as any) : null;
                    
                    return {
                        id: String(index + 1).padStart(3, '0'),
                        data: new Date(corrida.metadados?.inicio_timestamp || Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                        tamanho: `${corrida.metadados?.dimensao_labirinto || 16}x${corrida.metadados?.dimensao_labirinto || 16}`,
                        status: corrida.metadados?.status === 'concluido' ? 'Sucesso' : corrida.metadados?.status === 'interrompida' ? 'Interrompido' : 'Falha',
                        tempo: ultimaTel?.tempoMedio || '0.0s',
                        velMedia: ultimaTel?.velMedia || '0 m/s',
                        consumo: '420 mAh',
                        obstaculos: Object.keys(corrida.labirinto || {}).length,
                        distancia: (ultimaTel?.distancia || '0') + ' m'
                    };
                });
                
                setCorridasHistorico(formatoTabela);
            })
            .catch(error => console.error("Erro ao buscar dados:", error));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
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
        <>
            <div className={styles.Cards}>
                {stats.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
                    </div>    
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.5rem', margin: 0 }}>Histórico de testes</h3>
                <Button icon='add' label='NOVO PERCURSO' onClick={() => navigate('/percurso')} />
            </div>

            <div style={{ backgroundColor: '#0A0A0A', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: '#FFF' }}>
                    <thead style={{ borderBottom: '1px solid #333', color: '#FF5A00', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        <tr>
                            <th style={{ padding: '1.2rem 1rem' }}># ID</th>
                            <th>🕒 DATA/HORA</th>
                            <th>⚏ TAMANHO</th>
                            <th>✔ STATUS</th>
                            <th>⏱ TEMPO</th>
                            <th>☈ VEL. MÉDIA</th>
                            <th>⚡ CONSUMO</th>
                            <th>⚠ OBSTÁCULOS</th>
                            <th>☋ DISTÂNCIA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {corridasHistorico.map((corrida, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #1A1A1A' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#FFF' }}>{corrida.id}</td>
                                <td style={{ color: '#AAA' }}>{corrida.data}</td>
                                <td style={{ color: '#AAA' }}>{corrida.tamanho}</td>
                                <td style={{ color: corrida.status === 'Sucesso' ? '#00E676' : corrida.status === 'Falha' ? '#FF3D00' : '#FFC107', fontWeight: 'bold' }}>
                                    ● {corrida.status}
                                </td>
                                <td style={{ color: '#AAA' }}>{corrida.tempo}</td>
                                <td style={{ color: '#AAA' }}>{corrida.velMedia}</td>
                                <td style={{ color: '#AAA' }}>{corrida.consumo}</td>
                                <td style={{ color: '#AAA' }}>{corrida.obstaculos}</td>
                                <td style={{ color: '#AAA' }}>{corrida.distancia}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}