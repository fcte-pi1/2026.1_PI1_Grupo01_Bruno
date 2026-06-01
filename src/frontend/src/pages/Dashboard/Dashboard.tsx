import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Card } from '../../components/Card';
import { Battery } from '../../components/Battery';
import { Connection } from '../../components/Connection';

// Conexão do WebSocket (fora do componente para não ficar reconectando à toa)
const socket = io('http://localhost:3000');

export function Dashboard() {
    // os "estados" (variáveis) que vão guardar os dados pescados
    const [qtdTestes, setQtdTestes] = useState(0);
    const [taxaSucesso, setTaxaSucesso] = useState(0);
    
    const [bateriaNivel, setBateriaNivel] = useState(0);
    const [bateriaTensao, setBateriaTensao] = useState(0);
    
    // Status da conexão pode ser 'connected', 'disconnected' ou 'warn'
    const [statusConexao, setStatusConexao] = useState<'connected' | 'disconnected' | 'warn'>('warn');

    // O useEffect faz a pescaria assim que a tela abre
    useEffect(() => {
        //  Escutando a Conexão do Robô
        socket.on('connect', () => setStatusConexao('connected'));
        socket.on('disconnect', () => setStatusConexao('disconnected'));

        // Pescando os Dados do Banco 
        axios.get('http://localhost:3000/corridas')
            .then(response => {
                const dadosNode = response.data.dados;
                if (!dadosNode) return;

                // Transforma o objeto do Firebase num Array de corridas
                const listaCorridas = Object.values(dadosNode) as any[];
                
                // Pescando: Quantidade total de testes
                setQtdTestes(listaCorridas.length);

                // Pescando: Taxa de sucesso (quantas tem status 'concluido' x total)
                const concluidas = listaCorridas.filter(corrida => corrida.metadados?.status === 'concluido').length;
                const porcentagemSucesso = Math.round((concluidas / listaCorridas.length) * 100);
                setTaxaSucesso(porcentagemSucesso);

                // Pescando: Dados da bateria da ÚLTIMA corrida
                const ultimaCorrida = listaCorridas[listaCorridas.length - 1]; // Pega a última da lista
                if (ultimaCorrida && ultimaCorrida.telemetria) {
                    const listaTelemetria = Object.values(ultimaCorrida.telemetria) as any[];
                    const ultimaTelemetria = listaTelemetria[listaTelemetria.length - 1]; // Pega o último pulso enviado
                    
                    if (ultimaTelemetria) {
                        setBateriaNivel(ultimaTelemetria.mah_restante); // Ex: 95
                        setBateriaTensao(ultimaTelemetria.tensao);      // Ex: 8.2
                    }
                }
            })
            .catch(error => console.error("Erro ao buscar dados:", error));

        // Limpeza quando o componente é fechado
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    //  Renderizando os componentes com os DADOS REAIS
    return (
        <div>
            <h1>Dashboard (Integrado)</h1>

            <Card
                icon="analytics"
                label="Qtd. Testes"
                value={qtdTestes.toString()}
            />
            
            <Card
                icon="analytics" // criar um ícone de sucesso depois
                label="Taxa de Sucesso"
                value={`${taxaSucesso}%`}
            />

            {/* Injetando a bateria real. O componente vai desenhar baseado nesses números */}
            <Battery level={bateriaNivel} voltage={bateriaTensao} />

            {/* Injetando a conexão real (se o backend tá online ou não) */}
            <Connection status={statusConexao} port="WS" />
        </div>
    );
}