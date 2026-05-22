const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3000");

socket.on("connect", () => {
  console.log("Robô / Front-end conectado!");
  
  // Prepara o "Robô" para escutar comandos vindos do Front-end via broadcast
  socket.on("receiveCommand", (dados) => {
    console.log("ALERTA: Robô recebeu o comando via broadcast:", dados.comando);
    
    // Encerra o teste após receber o broadcast com sucesso
    setTimeout(() => process.exit(0), 500);
  });

  // 1. Inicia a corrida
  socket.emit("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 }, (resStart) => {
    const id = resStart.id_corrida;
    console.log("Largada! ID:", id);
    
    // 2. Testa a atualização da Posição Atual (vetor)
    socket.emit("post_posicao_atual", { id_corrida: id, posicao: 5 }, (resPos) => {
      console.log("Posição atualizada no Firebase:", resPos);
      
      // 3. Simula o Front-end enviando um comando para o Robô parar
      console.log(" Front-end enviando comando 'PAUSAR'...");
      socket.emit("sendcomand", { id_corrida: id, comando: "pausar" }, (resCmd) => {
        console.log("Servidor confirmou o envio do comando:", resCmd);
      });
    });
  });
});
