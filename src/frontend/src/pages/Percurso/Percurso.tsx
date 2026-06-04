import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/Card';
import { ControlBtn } from '../../components/ControlBtn';
import { Maze } from '../../components/Maze';
import styles from './Percurso.module.css';

const socket = io('http://localhost:3000');

interface LogEntry {
    time: string;
    message: string;
    type: 'info' | 'success' | 'warning';
}

export function Percurso() {
    const [idCorridaAtual, setIdCorridaAtual] = useState('');
    const [path, setPath] = useState<number[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    
    const [conexao, setConexao] = useState('DESCONECTADO');
    const [bateria, setBateria] = useState({ percent: 100, voltagem: '8.4' });
    
    const [telemetria, setTelemetria] = useState({
        status: 'Aguardando...',
        tempo: '0.00 s',
        velocidade: '0.00 m/s',
        distancia: '0.00 m',
        amperagem: '0 mA',
        voltagem: '0.0 V'
    });

    const getFormattedTime = () => {
        const now = new Date();
        const time = now.toLocaleTimeString('pt-BR', { hour12: false });
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `[${time}.${ms}]`;
    };

    const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setLogs(prev => [...prev, { time: getFormattedTime(), message, type }]);
    };

    useEffect(() => {
        socket.on('connect', () => {
            setConexao('CONECTADO');
            addLog('Sistema iniciado e conectado ao servidor', 'success');
        });

        socket.on('disconnect', () => {
            setConexao('DESCONECTADO');
            addLog('Conexão perdida com o ESP32', 'warning');
        });

        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const corridas = Object.entries(dadosNode);
                const [idUltima, dadosUltima] = corridas[corridas.length - 1] as [string, any];
                setIdCorridaAtual(idUltima);

                if (dadosUltima.labirinto) {
                    const paredesFormatadas = Object.entries(dadosUltima.labirinto).map(([chave, celula]: [string, any]) => {
                        const index = parseInt(chave.split('_')[1] || "0");
                        return {
                            index,
                            walls: { top: celula.n, bottom: celula.s, right: celula.l, left: celula.o }
                        };
                    });
                    setUpdates(paredesFormatadas);
                }

                if (dadosUltima.estado_atual?.posicao_vetor !== undefined) {
                    setPath([dadosUltima.estado_atual.posicao_vetor]);
                }
            })
            .catch(error => console.error("Front-end: Erro na API:", error));

        socket.on('novaPosicao', (novaPos: number) => {
            setPath(prev => [...prev, novaPos]);
        });

        socket.on('novaParede', (dado: any) => {
            setUpdates(prev => [...prev, {
                index: dado.celula,
                walls: { top: dado.n, bottom: dado.s, right: dado.l, left: dado.o }
            }]);
        });

        socket.on('novaTelemetria', (dado: any) => {
            setTelemetria(prev => ({
                ...prev,
                status: dado.status || prev.status,
                tempo: dado.tempoMedio !== undefined ? `${dado.tempoMedio}` : prev.tempo,
                velocidade: dado.velMedia !== undefined ? `${dado.velMedia}` : prev.velocidade,
                distancia: dado.distancia !== undefined ? `${dado.distancia} m` : prev.distancia,
                amperagem: dado.amperagem !== undefined ? `${dado.amperagem} mA` : prev.amperagem,
                voltagem: dado.voltagem !== undefined ? `${dado.voltagem} V` : prev.voltagem
            }));

            if (dado.voltagem) {
                setBateria(prev => ({
                    voltagem: `${dado.voltagem}`,
                    percent: Math.max(0, prev.percent - 0.5) 
                }));
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('novaPosicao');
            socket.off('novaParede');
            socket.off('novaTelemetria');
        };
    }, []);

    useEffect(() => {
        if (path.length === 0) return;

        const currentCell = path[path.length - 1];
        const isRevisit = path.indexOf(currentCell) !== path.length - 1;

        if (path.length === 5 && !isRevisit) {
            addLog('Mapeamento inicial do labirinto', 'info');
        }

        addLog(`Rato na célula ${currentCell} ${isRevisit ? '(Revisitada)' : '(Inédita)'}`, isRevisit ? 'warning' : 'info');

        if (currentCell === 12) {
            addLog('Caminho ótimo encontrado', 'info');
        } else if (currentCell === 15) { 
            addLog('Objetivo alcançado!', 'success');
            setTelemetria(prev => ({ ...prev, status: 'Sucesso' }));
        }
    }, [path]);

    const enviarComando = (comando: string) => {
        if (comando === 'iniciar') {
            setTelemetria(prev => ({
                ...prev,
                status: 'Em execução',
                tempo: '0.00 s',
                velocidade: '0.00 m/s',
                distancia: '0.00 m',
                amperagem: '0 mA',
                voltagem: '0.0 V'
            }));
            setPath([]);
            setUpdates([]);
            setLogs([]); 
            setBateria({ percent: 100, voltagem: '8.4' });
            addLog('Exploração iniciada', 'info');

            socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (res: any) => {
                if(res && res.id_corrida) {
                    setIdCorridaAtual(res.id_corrida);
                    socket.emit('sendcomand', { id_corrida: res.id_corrida, comando: comando });
                }
            });
            return;
        }

        if (!idCorridaAtual) return alert("Buscando ID da corrida, aguarde...");

        if (comando === 'reiniciar' || comando === 'cancelar') {
            setPath([]);
            setUpdates([]);
            setLogs([]); 
            setTelemetria(prev => ({ ...prev, status: comando === 'cancelar' ? 'Cancelado' : 'Aguardando...' }));
            addLog(`Percurso ${comando}`, 'info');
        } else if (comando === 'pausar') {
            setTelemetria(prev => ({ ...prev, status: 'Pausado' }));
            addLog('Percurso pausado', 'info');
        } else if (comando === 'continuar') {
            setTelemetria(prev => ({ ...prev, status: 'Em execução' }));
            addLog('Percurso retomado', 'info');
        }

        socket.emit('sendcomand', { id_corrida: idCorridaAtual, comando: comando });
    };

    const cards = [
        { icon: 'analytics', label: 'Status do Percurso', value: telemetria.status },
        { icon: 'timer', label: 'Tempo de Resolução', value: telemetria.tempo },
        { icon: 'speed', label: 'Velocidade Atual', value: telemetria.velocidade },
        { icon: 'route', label: 'Distância Percorrida', value: telemetria.distancia },
        { icon: 'battery_charging_full', label: 'Corrente Atual', value: telemetria.amperagem },
        { icon: 'bolt', label: 'Voltagem Atual', value: telemetria.voltagem }
    ];

    return (
        <div className={styles.MainTest}>
            <div className={styles.TopInfos}>
                <h3>Percurso</h3>
                <ControlBtn 
                    onStart={() => enviarComando('iniciar')}
                    onPause={() => enviarComando('pausar')}
                    onResume={() => enviarComando('continuar')}
                    onCancel={() => enviarComando('cancelar')}
                    onRestart={() => enviarComando('reiniciar')}
                />
            </div>

            <div className={styles.Content}>
                <Maze size={4} updates={updates} path={path} />
                
                <div className={styles.InfosLog}>
                    <div className={styles.ControlCards}>
                        {cards.map(card => (
                            <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />
                        ))}
                    </div>
    
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#FFF', letterSpacing: '1px' }}>LOG DE TESTE</h4>
                            <span onClick={() => setIsLogModalOpen(true)} style={{ fontSize: '0.75rem', color: '#FF5A00', cursor: 'pointer', fontWeight: 'bold' }}>
                                📄 VER LOG COMPLETO
                            </span>
                        </div>
                        
                        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', padding: '1rem', minHeight: '150px', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {logs.length === 0 ? (
                                <span style={{ color: '#555' }}>Aguardando eventos...</span>
                            ) : (
                                logs.slice(-5).map((log, index) => (
                                    <div key={index} style={{ color: log.type === 'success' ? '#00E676' : log.type === 'warning' ? '#FFC107' : '#AAAAAA', marginBottom: '4px', lineHeight: '1.4' }}>
                                        {log.time} {log.message}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isLogModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '600px', backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#FFF', margin: 0 }}>LOG DE TESTE COMPLETO</h3>
                            <button onClick={() => setIsLogModalOpen(false)} style={{ background: 'transparent', color: '#FF5A00', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕ FECHAR LOG</button>
                        </div>
                        <div style={{ backgroundColor: '#1A1A1A', borderRadius: '8px', padding: '1rem', height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {logs.map((log, index) => (
                                <div key={index} style={{ color: log.type === 'success' ? '#00E676' : log.type === 'warning' ? '#FFC107' : '#AAAAAA', marginBottom: '4px' }}>
                                    {log.time} {log.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.Charts} />
        </div>
    );
}