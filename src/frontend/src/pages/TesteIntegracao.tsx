import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Conecta no backend
const socket = io('http://localhost:3000'); 

export function TesteIntegracao() {
  const [corridas, setCorridas] = useState<any>(null);
  const [statusWs, setStatusWs] = useState('Desconectado');

  useEffect(() => {
    // Testa a Rota REST (GET) ao carregar a página
    axios.get('http://localhost:3000/corridas')
      .then(response => {
        console.log("Dados do Banco:", response.data);
        setCorridas(response.data);
      })
      .catch(error => console.error("Erro na API:", error));

    // 2. Testa a conexão do WebSocket
    socket.on('connect', () => setStatusWs('Conectado!'));
    socket.on('disconnect', () => setStatusWs('Caiu a conexão!'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // 3. Testa o envio de comandos para o robô
  const testarComando = (comando: string) => {
    // Simulando um ID válido que estaria no Firebase
    const idTeste = "id_simulado_123"; 
    
    socket.emit('sendcomand', { id_corrida: idTeste, comando: comando }, (resposta: any) => {
      console.log(`Resposta do comando ${comando}:`, resposta);
      alert(`Comando ${comando} enviado! Olhe o console.`);
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#333', color: 'white', fontFamily: 'sans-serif' }}>
      <h1>Painel de Teste de Integração (Marjorie)</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Status do WebSocket</h3>
        <p style={{ color: statusWs === 'Conectado!' ? 'lime' : 'red' }}>{statusWs}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>2. Teste de Comandos (Robô)</h3>
        <button onClick={() => testarComando('iniciar')} style={{ marginRight: '10px' }}>Iniciar Robô</button>
        <button onClick={() => testarComando('pausar')}>Pausar Robô</button>
      </div>

      <div>
        <h3>3. Teste da API (Banco de Dados)</h3>
        <p>Se aparecer dados abaixo, o GET está funcionando:</p>
        <pre style={{ backgroundColor: '#222', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
          {corridas ? JSON.stringify(corridas, null, 2) : 'Carregando banco...'}
        </pre>
      </div>
    </div>
  );
}