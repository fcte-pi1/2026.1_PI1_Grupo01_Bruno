const { io } = require("socket.io-client");
const socket = io("http://localhost:3000");

let isPaused = false; 

// Mapa falso 
const labirintoMock = {
  0: { n: true, s: false, l: false, o: true },
  1: { n: true, s: false, l: false, o: false },
  5: { n: false, s: false, l: true, o: false },
  9: { n: false, s: false, l: false, o: true },
  10: { n: true, s: true, l: false, o: false },
  6: { n: false, s: true, l: false, o: false },
  2: { n: true, s: false, l: false, o: true },
  3: { n: true, s: true, l: true, o: false }
};

socket.on("connect", () => {
  console.log("Robô simulado conectado!");


  socket.on("receiveCommand", (data) => {
    console.log("Comando recebido:", data.comando);
    
    if (data.comando === 'pausar') {
      isPaused = true;
      console.log("Robô em pausa.");
    } 
    else if (data.comando === 'iniciar' || data.comando === 'continuar') {
      isPaused = false;
      console.log(`Robô em movimento na corrida: ${data.id_corrida}`);
      
      // O caminho contíguo que faz sentido num grid 4x4
      const caminho = [1, 2, 3, 4, 8, 12, 16];
      let passo = 0;

      const intervalo = setInterval(() => {
        if (!isPaused) {
          if (passo >= caminho.length) {
            clearInterval(intervalo);
            socket.emit("postFinish", { id_corrida: data.id_corrida, bateria_final: 7.8 });
            console.log("Labirinto concluído.");
            return;
          }

          const posicao_atual = caminho[passo];
          console.log(`Explorando a célula: ${posicao_atual}`);
          
          
          socket.emit("post_posicao_atual", { id_corrida: data.id_corrida, posicao: posicao_atual });
          
          
          const paredes = labirintoMock[posicao_atual] || { n: false, s: false, l: false, o: false };
          socket.emit("postNos", { 
              id_corrida: data.id_corrida, 
              id_celula: posicao_atual, 
              ...paredes 
          });
          
          // manda a telemetria atualizada
          socket.emit("postVelBat", { 
            id_corrida: data.id_corrida, 
            velocidade: (Math.random() * 0.5 + 0.2).toFixed(2),
            corrente: 0.8, 
            tensao: 8.2, 
            mah_restante: 95 - passo,
            qtdTestes: "153", 
            taxaSucesso: "88%",
            tempoMedio:(passo * 1.5).toFixed(1) + "s",
            velMedia: (Math.random() * 0.5 + 0.2).toFixed(2) + " m/s",
            energia: "3.8 Wh",
            latencia: "18-120 ms",
            distancia: (Math.random() * 12).toFixed(2), 
            amperagem: Math.floor(Math.random() * (500 - 400 + 1) + 400), 
            voltagem: (7.4 - Math.random() * 0.5).toFixed(1)
          });

          passo++;
        }
      }, 1500); 
    } 
    else if (data.comando === 'cancelar') {
      isPaused = true;
      console.log("Corrida cancelada.");
    }
  });
});