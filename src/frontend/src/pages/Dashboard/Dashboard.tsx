import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Battery } from '../../components/Battery';
import { Connection } from '../../components/Connection';
import styles from './Dashboard.module.css';

// Conexão do WebSocket
const socket = io('http://localhost:3000');

export function Dashboard() {
    const navigate = useNavigate();

    // Estados da Integração (Back-end)
    const [qtdTestes, setQtdTestes] = useState(0);
    const [taxaSucesso, setTaxaSucesso] = useState(0);
    const [bateriaNivel, setBateriaNivel] = useState(0);
    const [bateriaTensao, setBateriaTensao] = useState(0);
    const [statusConexao, setStatusConexao] = useState<'connected' | 'disconnected' | 'warn'>('warn');

    useEffect(() => {
        // Escutando WebSockets
        socket.on('connect', () => setStatusConexao('connected'));
        socket.on('disconnect', () => setStatusConexao('disconnected'));

        // Buscando dados REST
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

                const ultimaCorrida = listaCorridas[listaCorridas.length - 1]; 
                if (ultimaCorrida && ultimaCorrida.telemetria) {
                    const listaTelemetria = Object.values(ultimaCorrida.telemetria) as any[];
                    const ultimaTelemetria = listaTelemetria[listaTelemetria.length - 1]; 
                    
                    if (ultimaTelemetria) {
                        setBateriaNivel(ultimaTelemetria.mah_restante || 0); 
                        setBateriaTensao(ultimaTelemetria.tensao || 0);      
                    }
                }
            })
            .catch(error => console.error("Erro ao buscar dados:", error));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    // Lista de cards mesclando os dados reais com os dados estáticos temporários
    const stats: { icon: string; label: string; value: string; size?: 'default' | 'lg' }[] = [
        { icon: 'science', label: 'Qtd. Testes', value: qtdTestes.toString(), size: 'lg' },
        { icon: 'check_circle', label: 'Taxa de sucesso', value: `${taxaSucesso}%`, size: 'lg' },
        { icon: 'timer', label: 'tempo médio', value: '43.3s', size: 'lg' },
        { icon: 'speed', label: 'Vel. média geral', value: '0.38 m/s', size: 'lg' },
        { icon: 'electric_bolt', label: 'Cons. energ. médio', value: '3.8 Wh', size: 'lg' },
        { icon: 'sync', label: 'Lat. méd. de comunicação', value: '18–120 ms', size: 'default' },
        { icon: 'alt_route', label: 'Eficiência de trajeto', value: '70,5%', size: 'default' },
        { icon: 'thermostat', label: 'Temp. média do sistema', value: '48°C', size: 'default' },
        { icon: 'shield', label: 'Confiabilidade geral', value: '92%', size: 'default' },
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Button icon='add' label='Novo percurso' onClick={() => navigate('/percurso')} />
                
                {/* Bateria e Conexão ao lado do botão */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Connection status={statusConexao} port="WS" />
                    <Battery level={bateriaNivel} voltage={bateriaTensao} />
                </div>
            </div>

            <div className={styles.Cards}>
                {stats.map(stat => (
                    <div key={stat.label} className={stat.size === 'lg' ? styles.SpanLg : styles.SpanDefault}>
                        <Card icon={stat.icon} label={stat.label} value={stat.value} size={stat.size} />
                    </div>    
                ))}
            </div>
        </>
    );
}