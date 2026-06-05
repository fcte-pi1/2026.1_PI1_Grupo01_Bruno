import { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../../socket'; 
import { Card } from '../../components/Card';
import { ControlBtn } from '../../components/ControlBtn';
import { Maze } from '../../components/Maze';
import { Chart } from '../../components/Chart/Chart';

interface LogEntry { time: string; message: string; type: 'info' | 'success' | 'warning'; }

export function Percurso() {
    const [idCorridaAtual, setIdCorridaAtual] = useState('');
    const [shortId, setShortId] = useState('000');
    const [mazeSize, setMazeSize] = useState(16);
    const [path, setPath] = useState<number[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    
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
            setTelemetria(prev => ({ ...prev, status: 'Em execução', tempo: '0.0s', velocidade: '0.00 m/s', distancia: '0.00 m', amperagem: '0 mA', voltagem: '0.0 V' }));
            setPath([]); setUpdates([]); setLogs([]);
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
            setPath([]); setUpdates([]); setLogs([]);
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
        <div style={{ width: '100%', paddingBottom: '4rem', color: '#FFF' }}>
            
            {/* SOLUÇÃO GRID: Força o título na esquerda e o botão travado na direita */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', width: '100%', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', margin: 0, textTransform: 'uppercase' }}>PERCURSO #{shortId}</h2>
                <div>
                    <ControlBtn 
                        onStart={() => enviarComando('iniciar')} onPause={() => enviarComando('pausar')}
                        onResume={() => enviarComando('continuar')} onCancel={() => enviarComando('cancelar')}
                        onRestart={() => enviarComando('reiniciar')}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '2rem', width: '100%' }}>
                <div style={{ backgroundColor: '#0D0D0D', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', width: '100%' }}>
                    <Maze size={mazeSize as any} updates={updates} path={path} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {cards.map(card => <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />)}
                    </div>
    
                    <div style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', borderRadius: '12px', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#FFF', letterSpacing: '1px' }}>LOG DE TESTE</h4>
                            <span onClick={() => setIsLogModalOpen(true)} style={{ fontSize: '0.75rem', color: '#FF5A00', cursor: 'pointer', fontWeight: 'bold' }}>📄 VER LOG COMPLETO</span>
                        </div>
                        <div style={{ height: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#AAA' }}>
                            {logs.length === 0 ? <span>Aguardando eventos...</span> : logs.slice(-6).map((log, index) => (
                                <div key={index} style={{ color: log.type === 'success' ? '#00E676' : log.type === 'warning' ? '#FFC107' : '#AAAAAA', marginBottom: '6px' }}>
                                    {log.time} {log.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', marginTop: '3rem', marginBottom: '1.5rem' }}>Dados Gerais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', width: '100%' }}>
                <Chart title="VELOCIDADE DURANTE O TESTE" dataKey="velocidade" icon="speed"/>
                <Chart title="EVOLUÇÃO DA DISTÂNCIA" dataKey="distancia" icon="alt_route" />
                <Chart title="VOLTAGEM DA BATERIA" dataKey="tensao" icon="bolt" />
                <Chart title="AMPERAGEM DA BATERIA" dataKey="corrente" icon="electric_bolt" />
            </div>

            {isLogModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '600px', backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#FFF', margin: 0 }}>LOG DE TESTE COMPLETO</h3>
                            <button onClick={() => setIsLogModalOpen(false)} style={{ background: 'transparent', color: '#FF5A00', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕ FECHAR LOG</button>
                        </div>
                        <div style={{ backgroundColor: '#1A1A1A', borderRadius: '8px', padding: '1rem', height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {logs.map((log, index) => <div key={index} style={{ color: log.type === 'success' ? '#00E676' : log.type === 'warning' ? '#FFC107' : '#AAAAAA', marginBottom: '4px' }}>{log.time} {log.message}</div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}