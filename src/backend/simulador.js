const io = require('socket.io-client');
const socket = io('http://localhost:3000', { query: { role: 'frontend' } }); 

let intervalo = null;
let passoAtual = 0;
let idAtual = null;
let bateriaMah = 1000;

// Caminho validado matematicamente para 16x16 (apenas pulos de +1, -1, +16, -16)
const pathReal = [
    0, 1, 2, 18, 34, 35, 36, 52, 68, 69, 70, 86, 102, 118, 119, 120, 136, 152, 168, 169, 170
];

socket.on('connect', () => {
    console.log('Simulador do Micromouse conectado ao Servidor!');
});


socket.on('receiveCommand', (data) => {
    console.log(` Comando recebido: ${data.comando} para a corrida ${data.id_corrida}`);
    idAtual = data.id_corrida;

    if (data.comando === 'iniciar' || data.comando === 'continuar') {
        clearInterval(intervalo);
        intervalo = setInterval(emitirDados, 1000); // Manda dados a cada 1 segundo
    } 
    else if (data.comando === 'pausar') {
        clearInterval(intervalo);
        console.log('Robô Pausado.');
    } 
    else if (data.comando === 'cancelar' || data.comando === 'reiniciar') {
        clearInterval(intervalo);
        passoAtual = 0;
        bateriaMah = 1000;
        console.log(' Robô Resetado.');
    }
});

function emitirDados() {
    if (passoAtual >= pathReal.length) {
        clearInterval(intervalo);
        socket.emit('postFinish', { id_corrida: idAtual, bateria_final: bateriaMah });
        console.log(' Percurso finalizado com sucesso!');
        return;
    }

    const pos = pathReal[passoAtual];
    bateriaMah -= 5; // Simula a bateria caindo a cada passo

    // Manda a Posição
    socket.emit('post_posicao_atual', { id_corrida: idAtual, posicao: pos });

    //  Manda a Parede falsa em volta do rato
    socket.emit('postNos', { 
        id_corrida: idAtual, id_celula: pos, 
        n: false, s: false, l: false, o: true 
    });

    //  Manda a Telemetria
    socket.emit('postVelBat', {
        id_corrida: idAtual,
        velocidade: (Math.random() * 0.4 + 0.2).toFixed(2),
        corrente: Math.floor(Math.random() * (500 - 400 + 1) + 400),
        tensao: (7.4 - (passoAtual * 0.05)).toFixed(2),
        mah_restante: bateriaMah,
        tempoMedio: (passoAtual * 1.5).toFixed(1),
        velMedia: "0.38",
        distancia: (passoAtual * 0.16).toFixed(2)
    });

    passoAtual++;
}