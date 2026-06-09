const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3000");

const emitir = (evento, dados) => {
  return new Promise((resolve) => {
    socket.emit(evento, dados, (resposta) => resolve(resposta));
  });
};

function checkError(response) {
  if (response && response.status === 'erro') {
    console.error("\nErro de Validação:", response.detalhes || response);
    process.exit(1);
  }
}

async function simularCorrida() {
  console.log("Conectado ao servidor!");

  // 1. Inicia
  const resStart = await emitir("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 });
  checkError(resStart);
  const id = resStart.id_corrida;
  console.log("Corrida iniciada! ID:", id);

  // 2. Mapeia Nó
  const resNos = await emitir("postNos", { id_corrida: id, id_celula: 1, n: true, s: false, l: true, o: false });
  checkError(resNos);
  console.log("Nó mapeado.");

  // 3. Telemetria (usei um for para fazer 5 isntantes)
  console.log("Iniciando envio de telemetria...");
  for (let i = 1; i <= 5; i++) {
    const dadosTelemetria = { 
      id_corrida: id, 
      velocidade: Math.floor(Math.random() * 5) + 1,
      corrente: 0.8, 
      tensao: 8.2, 
      mah_restante: 95 - i 
    };

    const resVel = await emitir("postVelBat", dadosTelemetria);
    checkError(resVel);
    console.log(`Telemetria ${i} enviada.`);
    
    // pausa de 1 segundos entre os instantes
    await new Promise(r => setTimeout(r, 1000));
  }

  // 4. Finaliza
  const resFin = await emitir("postFinish", { id_corrida: id, bateria_final: 7.8 });
  checkError(resFin);
  console.log("Corrida finalizada com sucesso!");
  process.exit(0);
}

socket.on("connect", simularCorrida);