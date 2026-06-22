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

interface LogEntry { time: string; message: string; type: 'info' | 'success' | 'warning'; }

export function Percurso() {
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
        status: 'Aguardando...', tempo: '0.0s', velocidade: '0.00 m/s',
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
                const indexUltima = corridas.length - 1;
                const [idUltima, dadosUltima] = corridas[indexUltima] as [string, any];
                
                setIdCorridaAtual(idUltima);
                setShortId(String(indexUltima + 1).padStart(3, '0')); 

                if (dadosUltima.metadados?.dimensao_labirinto) setMazeSize(dadosUltima.metadados.dimensao_labirinto);

                if (dadosUltima.labirinto) {
                    const paredesFormatadas = Object.entries(dadosUltima.labirinto).map(([chave, celula]: [string, any]) => {
                        const index = parseInt(chave.split('_')[1] || "0");
                        return { index, walls: { top: celula.n, bottom: celula.s, right: celula.l, left: celula.o } };
                    });
                    setUpdates(paredesFormatadas);
                }
                if (dadosUltima.estado_atual?.posicao_vetor !== undefined) setPath([dadosUltima.estado_atual.posicao_vetor]);
            }).catch(console.error);

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

        return () => { socket.off('novaPosicao'); socket.off('novaParede'); socket.off('novaTelemetria'); };
    }, []);

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
            distanciaAtualRef.current = 0; // reseta a distância acumulada
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
            distanciaAtualRef.current = 0; // reseta a distância acumulada
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
            <section>
                <div className={styles.TopInfos}>
                    <h2>Percurso #{shortId}</h2>
                    <div className={styles.BtnContainer}>
                        <ControlBtn 
                            onStart={() => enviarComando('iniciar')} onPause={() => enviarComando('pausar')}
                            onResume={() => enviarComando('continuar')} onCancel={() => enviarComando('cancelar')}
                            onRestart={() => enviarComando('reiniciar')}
                        />
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
                    <div className={styles.innerModalLog}>
                        <Log entries={logs} standalone={false} />
                    </div>
            </Modal>
        )}
        </div>
    );
}