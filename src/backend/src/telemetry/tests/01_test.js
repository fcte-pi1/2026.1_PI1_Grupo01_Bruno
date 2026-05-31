const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3000");

function checkError(response) {
  if (response && response.status === 'erro') {
    console.error("\nErro de Validação:");
    console.error(JSON.stringify(response.detalhes || response, null, 2));
    process.exit(1);
  }
}


// Nesse teste é para tudo funcionar
socket.on("connect", () => {
  console.log("Conectado ao servidor!");
  
  socket.on("receiveCommand", (dados) => {
    console.log("ALERTA: Comando recebido via broadcast:", dados.comando);
    setTimeout(() => process.exit(0), 500);
  });

  // 1. Largada
  socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (resStart) => {
    checkError(resStart);
    const id = resStart.id_corrida;
    console.log("Largada confirmada! ID:", id);
    
    // 2. Mapeia um nó (célula)
    socket.emit("postNos", { id_corrida: id, id_celula: 1, n: true, s: false, l: true, o: false }, (resNos) => {
      checkError(resNos);
      console.log("Nó atualizado!");

      // 3. Envia telemetria
      socket.emit("postVelBat", { id_corrida: id, velocidade: 1.5, corrente: 0.8, tensao: 8.2, mah_restante: 95 }, (resVel) => {
        checkError(resVel);
        console.log("Telemetria atualizada!");

        // 4. Atualiza posição
        socket.emit("post_posicao_atual", { id_corrida: id, posicao: 5 }, (resPos) => {
          checkError(resPos);
          console.log("Posição atualizada!");
          
          // 5. Simula comando do front
          socket.emit("sendcomand", { id_corrida: id, comando: "pausar" }, (resCmd) => {
            checkError(resCmd);
            
            // 6. Finaliza a corrida
            socket.emit("postFinish", { id_corrida: id, bateria_final: 7.8 }, (resFin) => {
              checkError(resFin);
              console.log("Corrida finalizada com sucesso no banco!");
            });
          });
        });
      });
    });
  });
});