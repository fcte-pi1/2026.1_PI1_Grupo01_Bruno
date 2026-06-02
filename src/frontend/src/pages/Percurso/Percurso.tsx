import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/Card';
import { ControlBtn } from '../../components/ControlBtn';
import { Maze } from '../../components/Maze';
import styles from './Percurso.module.css';

const socket = io('http://localhost:3000');

export function Percurso() {
    const [idCorridaAtual, setIdCorridaAtual] = useState('');
    const [path, setPath] = useState<number[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [telemetria, setTelemetria] = useState({
        qtdTestes: '0',
        taxaSucesso: '0%',
        tempoMedio: '0s',
        velMedia: '0.00 m/s',
        energia: '0.0 Wh',
        latencia: '0-0 ms'
    });

    useEffect(() => {
        socket.on('connect', () => console.log("Front-end: Socket conectado!"));

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
            setTelemetria({
                qtdTestes: dado.qtdTestes || '0',
                taxaSucesso: dado.taxaSucesso || '0%',
                tempoMedio: dado.tempoMedio || '0s',
                velMedia: dado.velMedia || '0.00 m/s',
                energia: dado.energia || '0.0 Wh',
                latencia: dado.latencia || '0-0 ms'
            });
        });

        return () => {
            socket.off('connect');
            socket.off('novaPosicao');
            socket.off('novaParede');
            socket.off('novaTelemetria');
        };
    }, []);

    const enviarComando = (comando: string) => {
        if (comando === 'iniciar') {
            socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (res: any) => {
                setIdCorridaAtual(res.id_corrida);
                setPath([]);
                setUpdates([]);
                setTelemetria({
                    qtdTestes: '0', taxaSucesso: '0%', tempoMedio: '0s',
                    velMedia: '0.00 m/s', energia: '0.0 Wh', latencia: '0-0 ms'
                });
                console.log(`Nova corrida gerada pelo front: ${res.id_corrida}`);
                
                socket.emit('sendcomand', { id_corrida: res.id_corrida, comando: comando });
            });
            return;
        }

        if (!idCorridaAtual) return alert("Buscando ID da corrida, aguarde...");

        if (comando === 'reiniciar' || comando === 'cancelar') {
            setPath([]);
            setUpdates([]);
        }

        socket.emit('sendcomand', { id_corrida: idCorridaAtual, comando: comando });
    };

    const cards = [
        { icon: 'science', label: 'Qtd. Testes', value: telemetria.qtdTestes },
        { icon: 'check_circle', label: 'Taxa de Sucesso', value: telemetria.taxaSucesso },
        { icon: 'timer', label: 'Tempo Médio', value: telemetria.tempoMedio },
        { icon: 'speed', label: 'Vel. Média Geral', value: telemetria.velMedia },
        { icon: 'bolt', label: 'Cons. Energ. Médio', value: telemetria.energia },
        { icon: 'wifi', label: 'Lat. Méd. Comunicação', value: telemetria.latencia }
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
                </div>
            </div>

            <div className={styles.Charts} />
        </div>
    );
}