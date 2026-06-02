const { io } = require("socket.io-client");
const socket = io("http://localhost:3000");

let isPaused = false; 

socket.on("connect", () => {
  console.log(" Robô simulado conectado!");

  socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (res) => {
    const id_corrida = res.id_corrida;
    console.log(`Corrida iniciada: ${id_corrida}`);

    const caminho = [0, 1, 5, 9, 10, 6];
    let passo = 0;

    const intervalo = setInterval(() => {
      
      if (!isPaused) {
        if (passo >= caminho.length) {
          clearInterval(intervalo);
          socket.emit("postFinish", { id_corrida, bateria_final: 7.8 });
          console.log("Labirinto concluído.");
          process.exit(0);
        }

        const posicao_atual = caminho[passo];
        console.log(` Andando para: ${posicao_atual}`);
        
        socket.emit("post_posicao_atual", { id_corrida, posicao: posicao_atual });
        
        socket.emit("postVelBat", { 
          id_corrida, 
          velocidade: (Math.random() * 0.5 + 0.2).toFixed(2),
          corrente: 0.8, 
          tensao: 8.2, 
          mah_restante: 95 - passo 
        });

        passo++;
      } else {
        console.log("Robô em pausa...");
      }
    }, 2000); 
  });
});


socket.on("receiveCommand", (data) => {
  console.log("Comando recebido:", data.comando);
  
  if (data.comando === 'pausar') {
    isPaused = true;
  } else if (data.comando === 'continuar' || data.comando === 'iniciar') {
    isPaused = false;
  } else if (data.comando === 'reiniciar') {
    passo = 0;      
    isPaused = false;   
    console.log("Robô reiniciado! Voltando ao início.");
  } else if (data.comando === 'cancelar') {
    console.log("Corrida cancelada pelo front-end.");
    process.exit(0);
  }
});