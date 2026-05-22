const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3000");

socket.on("connect", () => {
  console.log("Robô conectado!");
  
  // 1. Inicia
  socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (resStart) => {
    const id = resStart.id_corrida;
    console.log("Largada! ID:", id);
    
    // 2. Mapeia Célula
    socket.emit("postNos", { id_corrida: id, id_celula: 0, n: true, s: false, l: false, o: true }, () => {
      console.log("Célula 0 mapeada.");
      
      // 3. Manda Telemetria
      socket.emit("postVelBat", { id_corrida: id, velocidade: 1.2, corrente: 400, tensao: 7.4, mah_restante: 8.2 }, () => {
        console.log("Telemetria gravada.");
        
        // 4. Finaliza a Corrida!
        socket.emit("postFinish", { id_corrida: id, bateria_final: 7.9 }, (resFinish) => {
          console.log("🏁 Status do encerramento:", resFinish);
          process.exit(0);
        });
      });
    });
  });
});
