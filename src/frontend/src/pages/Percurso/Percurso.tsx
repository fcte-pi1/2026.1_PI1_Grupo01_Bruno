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
    const [points, setPoints] = useState<any[]>([]); 
    
    
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
            setTelemetria(prev => ({
                ...prev,
                status: dado.status || prev.status,
                tempo: dado.tempoMedio !== undefined ? `${dado.tempoMedio}s` : prev.tempo,
                velocidade: dado.velocidade !== undefined ? `${dado.velocidade} m/s` : prev.velocidade,
                distancia: dado.distancia !== undefined ? `${dado.distancia} m` : prev.distancia,
                amperagem: dado.corrente !== undefined ? `${dado.corrente} mA` : prev.amperagem,
                voltagem: dado.tensao !== undefined ? `${dado.tensao} V` : prev.voltagem
            }));
            const chartPoint = { ...dado, time: new Date(dado.timestamp).toLocaleTimeString('pt-BR', { minute: '2-digit', second: '2-digit' }) };
            setPoints(prev => [...prev, chartPoint]);
        });

        return () => { socket.off('novaPosicao'); socket.off('novaParede'); socket.off('novaTelemetria'); };
    }, []);

    const enviarComando = (comando: string) => {
        if (comando === 'iniciar') {
            setTelemetria(prev => ({ ...prev, status: 'Em execução', tempo: '0.0s', velocidade: '0.00 m/s', distancia: '0.00 m', amperagem: '0 mA', voltagem: '0.0 V' }));
            setPath([]); setUpdates([]); setLogs([]); setPoints([]);
            addLog('Exploração iniciada', 'info');
            socket.emit("postStart", { num_cell: 16, bat_total: 1000, bat_inicial: 8.4 }, (res: any) => {
                if(res?.id_corrida) { setIdCorridaAtual(res.id_corrida); socket.emit('sendcomand', { id_corrida: res.id_corrida, comando }); }
            });
            return;
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
            {/* ALINHAMENTO FORÇADO: Flex + margin-left auto */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', margin: 0, textTransform: 'uppercase' }}>PERCURSO #{shortId}</h2>
                <div style={{ marginLeft: 'auto' }}>
                    <ControlBtn 
                        onStart={() => enviarComando('iniciar')} onPause={() => enviarComando('pausar')}
                        onResume={() => enviarComando('continuar')} onCancel={() => enviarComando('cancelar')}
                        onRestart={() => enviarComando('reiniciar')}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '2rem', width: '100%' }}>
                <div style={{ backgroundColor: '#0D0D0D', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                    <Maze size={mazeSize as any} updates={updates} path={path} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {cards.map(card => <Card key={card.label} icon={card.icon} label={card.label} value={card.value} size="default" />)}
                    </div>
                    <div style={{ backgroundColor: '#0D0D0D', border: '1px solid #222', borderRadius: '12px', padding: '1rem', flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#FFF' }}>LOG DE TESTE</h4>
                        <div style={{ height: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#AAA' }}>
                            {logs.slice(-6).map((log, index) => <div key={index} style={{ marginBottom: '6px' }}>{log.time} {log.message}</div>)}
                        </div>
                    </div>
                </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginTop: '3rem', marginBottom: '1.5rem' }}>Dados Gerais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <Chart title="VELOCIDADE DURANTE O TESTE" dataKey="velocidade" icon="speed" points={points} />
                <Chart title="EVOLUÇÃO DA DISTÂNCIA" dataKey="distancia" icon="alt_route" points={points} />
                <Chart title="VOLTAGEM DA BATERIA" dataKey="tensao" icon="bolt" points={points} />
                <Chart title="AMPERAGEM DA BATERIA" dataKey="corrente" icon="electric_bolt" points={points} />
            </div>
        </div>
    );
}