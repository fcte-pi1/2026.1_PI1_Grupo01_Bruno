import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { socket } from '../../socket'; 
import { Card } from '../../components/Card';
import { ControlBtn } from '../../components/ControlBtn';
import { Maze } from '../../components/Maze';
import { Chart } from '../../components/Chart';
import { Log } from '../../components/Log';
import { Modal } from '../../components/Modal';
import styles from './Percurso.module.css';
import { useParams } from 'react-router-dom'; 

const safeNum = (val: any) => { const n = Number(val); return isNaN(n) ? 0 : n; };

interface LogEntry { time: string; message: string; type: 'info' | 'success' | 'warning'; }

export function Percurso() {
    const { id: idConsulta } = useParams(); 
    const isConsulta = !!idConsulta; 

    const [idCorridaAtual, setIdCorridaAtual] = useState('');
    const [shortId, setShortId] = useState('000');
    const [mazeSize, setMazeSize] = useState(16);
    const [path, setPath] = useState<number[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [points, setPoints] = useState<any[]>([]); 
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const distanciaAtualRef = useRef(0); 

    const [telemetria, setTelemetria] = useState({
        status: 'Aguardando...', tempo: '0.000s', velocidade: '0.00 m/s',
        distancia: '0.00 m', amperagem: '0 mA', voltagem: '0.0 V'
    });

    const getFormattedTime = () => {
        const now = new Date();
        return `[${now.toLocaleTimeString('pt-BR', { hour12: false })}.${String(now.getMilliseconds()).padStart(3, '0')}]`;
    };

    const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setLogs(prev => [...prev, { time: getFormattedTime(), message, type }]);
    };

    useEffect(() => {
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                const corridas = Object.entries(dadosNode);
                
                let idSelecionado = '';
                let dadosSelecionados: any = null;
                let indexCorrida = 0;

                if (isConsulta && dadosNode[idConsulta]) {
                    idSelecionado = idConsulta;
                    dadosSelecionados = dadosNode[idConsulta];
                    indexCorrida = corridas.findIndex(([key]) => key === idConsulta);
                } else {
                    const indexUltima = corridas.length - 1;
                    const [idUltima, dadosUltima] = corridas[indexUltima] as [string, any];
                    idSelecionado = idUltima;
                    dadosSelecionados = dadosUltima;
                    indexCorrida = indexUltima + 1;
                    
                    
                }

                setIdCorridaAtual(idSelecionado);
                setShortId(String(indexCorrida + 1).padStart(3, '0')); 
                if (dadosSelecionados.metadados?.dimensao_labirinto) setMazeSize(dadosSelecionados.metadados.dimensao_labirinto);

                if (dadosSelecionados.labirinto) {
                    const paredesFormatadas = Object.entries(dadosSelecionados.labirinto).map(([chave, celula]: [string, any]) => {
                        const index = parseInt(chave.split('_')[1] || "0");
                        return { index, walls: { top: celula.n, bottom: celula.s, right: celula.l, left: celula.o } };
                    });
                    setUpdates(paredesFormatadas);
                }
                
                if (dadosSelecionados.estado_atual?.posicao_vetor !== undefined) {
                    setPath([dadosSelecionados.estado_atual.posicao_vetor]);
                }

                if (isConsulta && dadosSelecionados) {
                    const STATUS_MAP: Record<string, string> = {
                        'concluido': 'Concluído', 
                        'interrompida': 'Interrompido', 
                        'em_execucao': 'Em curso'
                    };
                    const statusRaw = dadosSelecionados.metadados?.status || 'concluido';
                    const statusFormatado = STATUS_MAP[statusRaw.toLowerCase()] || 'Desconhecido';

                    let distTotal = 0;
                    let lastTimeStamp = 0;
                    const inicioTs = safeNum(dadosSelecionados.metadados?.inicio_timestamp);
                    let fimTs = safeNum(dadosSelecionados.metadados?.fim_timestamp);

                    const eventos = dadosSelecionados.telemetria ? Object.values(dadosSelecionados.telemetria) as any[] : [];
                    const ultimaTel = eventos.length > 0 ? eventos[eventos.length - 1] : null;

                    if (fimTs <= 0 && ultimaTel?.timestamp) {
                        fimTs = safeNum(ultimaTel.timestamp);
                    } 

                    const duration = (fimTs > inicioTs && inicioTs > 0) ? (fimTs - inicioTs) / 1000 : 0;
                    const chartData: any[] = [];

                    eventos.forEach((tel: any) => {
                        let Tel = Object(tel);
                        if (distTotal !== -1) {
                            if (lastTimeStamp === 0) lastTimeStamp = inicioTs;
                            if (Tel.timestamp < lastTimeStamp) {
                                distTotal = -1;
                            } else {
                                distTotal += safeNum(Tel.velocidade) * (safeNum(Tel.timestamp) - lastTimeStamp) / 1000;
                                lastTimeStamp = safeNum(Tel.timestamp);
                            }
                        }

                        chartData.push({
                            ...Tel,
                            velocidade: safeNum(Tel.velocidade) || safeNum(Tel.velMedia),
                            tensao: safeNum(Tel.tensao) || safeNum(Tel.voltagem),
                            corrente: safeNum(Tel.corrente),
                            distancia: distTotal !== -1 ? distTotal : 0,
                            timestamp: Tel.timestamp ?? Date.now()
                        });
                    });

                    setPoints(chartData); 

                    const velocidadeMediaDashboard = eventos.length > 0
                        ? eventos.reduce((acc: number, e: any) => acc + safeNum(e.velocidade), 0) / eventos.length
                        : 0;

                    setTelemetria({
                        status: statusFormatado,
                        tempo: `${duration.toFixed(3)}s`,
                        velocidade: `${velocidadeMediaDashboard.toFixed(2)} m/s`,
                        distancia: `${distTotal !== -1 ? distTotal.toFixed(2) : '0.00'} m`,
                        amperagem: ultimaTel?.corrente !== undefined ? `${ultimaTel.corrente} mA` : '0 mA',
                        voltagem: ultimaTel?.tensao !== undefined ? `${ultimaTel.tensao} V` : (ultimaTel?.voltagem !== undefined ? `${ultimaTel.voltagem} V` : '0.0 V')
                    });
                }
            }).catch(console.error);

        if (!isConsulta) {
            socket.on('novaPosicao', (novaPos: number) => setPath(prev => [...prev, novaPos]));
            socket.on('novaParede', (dado: any) => setUpdates(prev => [...prev, { index: dado.celula, walls: { top: dado.n, bottom: dado.s, right: dado.l, left: dado.o } }]));

            socket.on('novaTelemetria', (dado: any) => {
                if (dado.distancia !== undefined) {
                    distanciaAtualRef.current = dado.distancia;
                }

                setTelemetria(prev => ({
                    ...prev,
                    status: dado.status || prev.status,
                    tempo: dado.tempoMedio !== undefined ? `${dado.tempoMedio}s` : prev.tempo,
                    velocidade: dado.velocidade !== undefined ? `${dado.velocidade} m/s` : prev.velocidade,
                    distancia: dado.distancia !== undefined ? `${dado.distancia} m` : prev.distancia,
                    amperagem: dado.corrente !== undefined ? `${dado.corrente} mA` : prev.amperagem,
                    voltagem: dado.tensao !== undefined ? `${dado.tensao} V` : prev.voltagem
                }));
                
                setPoints(prev => [...prev, {
                    ...dado,
                    distancia: distanciaAtualRef.current,
                    timestamp: dado.timestamp ?? Date.now(),
                }]);
            });
        }

        return () => { socket.off('novaPosicao'); socket.off('novaParede'); socket.off('novaTelemetria'); };
    }, [isConsulta, idConsulta]); 

    useEffect(() => {
        if (path.length === 0) return;
        const currentCell = path[path.length - 1];
        const isRevisit = path.indexOf(currentCell) !== path.length - 1;

        if (path.length === 5 && !isRevisit) addLog('Mapeamento inicial do labirinto', 'info');
        addLog(`Rato na célula ${currentCell} ${isRevisit ? '(Revisitada)' : '(Inédita)'}`, isRevisit ? 'warning' : 'info');

        const finalCell = (mazeSize * mazeSize) - 1;
        if (currentCell === finalCell || currentCell === 12) { 
            addLog('Objetivo alcançado!', 'success'); 
            setTelemetria(prev => ({ ...prev, status: 'Sucesso' })); 
        }
    }, [path, mazeSize]);

    const enviarComando = (comando: string) => {
        if (comando === 'iniciar') {
            distanciaAtualRef.current = 0; 
            setTelemetria(prev => ({ ...prev, status: 'Em execução', tempo: '0.0s', velocidade: '0.00 m/s', distancia: '0.00 m', amperagem: '0 mA', voltagem: '0.0 V' }));
            setPath([]); setUpdates([]); setLogs([]); setPoints([]);    
            addLog('Exploração iniciada', 'info');

            socket.emit("postStart", { num_cell: 16, bat_total: 1000, bat_inicial: 8.4 }, (res: any) => {
                if(res && res.id_corrida) {
                    setIdCorridaAtual(res.id_corrida);
                    socket.emit('sendcomand', { id_corrida: res.id_corrida, comando });
                }
            });
            return;
        }

        if (comando === 'reiniciar' || comando === 'cancelar') {
            distanciaAtualRef.current = 0; 
            setPath([]); setUpdates([]); setLogs([]); setPoints([]);
            setTelemetria(prev => ({ ...prev, status: comando === 'cancelar' ? 'Cancelado' : 'Aguardando...' }));
            addLog(`Percurso ${comando}`, 'info');
        } else if (comando === 'pausar') {
            setTelemetria(prev => ({ ...prev, status: 'Pausado' })); addLog('Percurso pausado', 'info');
        } else if (comando === 'continuar') {
            setTelemetria(prev => ({ ...prev, status: 'Em execução' })); addLog('Percurso retomado', 'info');
        }
        socket.emit('sendcomand', { id_corrida: idCorridaAtual, comando });
    };

    const statusLower = String(telemetria.status).toLowerCase();
    const rotuloTempo = statusLower.includes('conclu') ? 'Tempo de Resolução' : 'Tempo de Tentativa';

    const cards = [
        { icon: 'analytics', label: 'Status do Percurso', value: telemetria.status },
        { icon: 'timer', label: rotuloTempo, value: telemetria.tempo }, 
        { icon: 'speed', label: 'Velocidade Atual', value: telemetria.velocidade },
        { icon: 'route', label: 'Distância Percorrida', value: telemetria.distancia },
        { icon: 'battery_charging_full', label: 'Corrente Atual', value: telemetria.amperagem },
        { icon: 'bolt', label: 'Voltagem Atual', value: telemetria.voltagem }
    ];

    return (
        <div className={styles.MainTest}>
            <section>
                <div className={styles.TopInfos}>
                    <h2>{isConsulta ? 'Percurso' : 'Percurso'} #{shortId}</h2>
                    <div>
                        {!isConsulta && (
                            <ControlBtn 
                                onStart={() => enviarComando('iniciar')} onPause={() => enviarComando('pausar')}
                                onResume={() => enviarComando('continuar')} onCancel={() => enviarComando('cancelar')}
                                onRestart={() => enviarComando('reiniciar')}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.Content}>
                    <Maze size={mazeSize as any} updates={updates} path={path} />
                    
                    <div className={styles.InfosLog}>
                        <div className={styles.ControlCards}>
                            {cards.map(card => <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />)}
                        </div>
        
                        <Log 
                            entries={logs}
                            onViewFull={() => setIsLogModalOpen(true)}
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3>Dados Gerais</h3>
                <div className={styles.Charts}>
                    <Chart title="VELOCIDADE DURANTE O TESTE" dataKey="velocidade" icon="speed" points={points} />
                    <Chart title="EVOLUÇÃO DA DISTÂNCIA" dataKey="distancia" icon="alt_route" points={points} />
                    <Chart title="VOLTAGEM DA BATERIA" dataKey="tensao" icon="bolt" points={points} />
                    <Chart title="AMPERAGEM DA BATERIA" dataKey="corrente" icon="electric_bolt" points={points} />
                </div>
            </section>

        {isLogModalOpen && (
            <Modal
                open={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                title="Log de teste"
            >
                <div>
                    <Log entries={logs} standalone={false} />
                </div>
            </Modal>
        )}
        </div>
    );
}