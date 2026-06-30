import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';

const STATUS_BADGE: Record<string, 'success' | 'warn' | 'alert'> = {
  'Concluído': 'success', 
  'Interrompido': 'alert', 
  'Em curso': 'warn',
};
const STATUS_LABEL: Record<string, string> = {
    'concluido': 'Concluído', 
    'interrompida': 'Interrompido', 
    'em_execucao': 'Em curso',
};

const safeNum = (val: any) => { const n = Number(val); return isNaN(n) ? 0 : n; };

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
    { key: 'duracao', label: 'Duração', icon: 'timer', render: (value) => <p>{Number(value).toFixed(3)}s</p> },
    { key: 'velocity', label: 'Vel. Média', icon: 'speed', render: (value) => <p>{Number(value).toFixed(2)} m/s</p> },
    { key: 'consume', label: 'Consumo', icon: 'electric_bolt', render: (value) => <p>{Number(value).toFixed(0)} mAh</p> },
    { key: 'distance', label: 'Distância', icon: 'route', render: (value) => <p>{Number(value).toFixed(2)} m</p> },
];

export function Historico() {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);

    const fetchCorridas = () => {
        axios.get('http://localhost:3000/corridas').then(response => {
            const dadosNode = response.data.dados;
            if (!dadosNode) return;

            const listaCorridas = Object.entries(dadosNode);
            const formatoTabela = listaCorridas.map(([firebaseId, corrida]: any, index) => {
                let distTotal = 0;
                let lastTimeStamp = 0;
                const inicioTs = safeNum(corrida.metadados?.inicio_timestamp);
                let fimTs = safeNum(corrida.metadados?.fim_timestamp);
                
                const eventos = corrida.telemetria ? Object.values(corrida.telemetria) as any[] : [];
                const ultimaTel = eventos.length > 0 ? eventos[eventos.length - 1] : null;

                if (fimTs <= 0 && ultimaTel?.timestamp) {
                    fimTs = safeNum(ultimaTel.timestamp);
                }

                const duration = (fimTs > inicioTs && inicioTs > 0) ? (fimTs - inicioTs) / 1000 : 0;
                
                eventos.forEach((tel: any) => {
                    let Tel = Object(tel);
                    if(distTotal !== -1){
                        if(lastTimeStamp === 0) {
                            lastTimeStamp = inicioTs;
                        }

                        if(Tel.timestamp < lastTimeStamp){
                            distTotal = -1;
                        } else {
                            distTotal += safeNum(Tel.velocidade) * (safeNum(Tel.timestamp) - lastTimeStamp) / 1000;
                            lastTimeStamp = safeNum(Tel.timestamp);
                        }
                    }
                });

                const mahRestante = safeNum(ultimaTel?.mah_restante);

                const velocidadeMediaDashboard = eventos.length > 0
                    ? eventos.reduce((acc: number, e: any) => acc + safeNum(e.velocidade), 0) / eventos.length
                    : 0;

                return {
                    id: firebaseId, 
                    displayId: index + 1, 
                    datetime: new Date(inicioTs > 0 ? inicioTs : Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                    size: `${corrida.metadados?.dimensao_labirinto || 16}x${corrida.metadados?.dimensao_labirinto || 16}` as any,
                    status: corrida.metadados?.status || 'concluido',
                    duracao: duration, 
                    velocity: velocidadeMediaDashboard, 
                    consume: mahRestante > 0 ? 1000 - mahRestante : 0, 
                    distance: distTotal !== -1 ? distTotal : 0
                };
            });
            setData(formatoTabela.reverse()); 
        }).catch(console.error);
    };

    useEffect(() => { fetchCorridas(); }, []);

   const apagarCorrida = async (param: any) => {
        console.log('O botão foi clicado!', param);
        
        const idParaApagar = typeof param === 'object' ? param.id : param;
        console.log('O ID extraído é:', idParaApagar);
        
        if (!idParaApagar) {
            console.error('ERRO: O ID está vazio!');
            return;
        }
        
        try {
            console.log(`Enviando ordem para apagar a corrida: ${idParaApagar}`);
            const response = await axios.delete(`http://localhost:3000/corridas/${idParaApagar}`);
            console.log('Back-end respondeu:', response.data);
            
            fetchCorridas(); 
        } catch (error) { 
            console.error(" Deu erro na API:", error); 
        }
    };

   return (
        <>
            <div>
                <Table 
                    columns={columns} 
                    data={data} 
                    onDelete={apagarCorrida} 
                    onRowClick={(id) => navigate(`/percurso/${id}`)} 
                />
            </div>
        </>
    );
}