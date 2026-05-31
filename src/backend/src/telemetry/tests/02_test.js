const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3000");

function emitAsync(event, data, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ status: 'erro', detalhes: ['Timeout de resposta esgotado'] });
    }, timeoutMs);

    socket.emit(event, data, (response) => {
      clearTimeout(timer); 
      resolve(response);
    });
  });
}

function assertValidationError(testName, response) {
  if (response && response.status === 'erro') {
    console.log(`[SUCESSO] ${testName}: O backend barrou corretamente.`);
    console.log(`Erros retornados:`, JSON.stringify(response.detalhes, null, 2));
  } else {
    console.error(`[FALHA] ${testName}: O servidor aceitou o dado ou retornou um formato inesperado!`);
    console.error(`Resposta obtida:`, response);
  }
  console.log("-".repeat(70));
}

socket.on("connect", async () => {
  console.log("Conectado ao servidor do XAROPi! Iniciando bateria de testes...\n");


  // Teste de formato errado (string em campo de número)
  const res1 = await emitAsync("postStart", { 
    num_cell: "dezesseis", 
    bat_total: 100, 
    bat_inicial: 8.4 
  });
  assertValidationError("Teste 1 (Número inválido - num_cell como string)", res1);

  // Teste de formato errado (número em campo de string)
  const corridaValida = await emitAsync("postStart", { num_cell: 16, bat_total: 100, bat_inicial: 8.4 });
  const idCorridaValido = corridaValida.id_corrida;

  const res2 = await emitAsync("sendcomand", { 
    id_corrida: idCorridaValido, 
    comando: 124 
  });
  assertValidationError("Teste 2 (String inválida - string como número)", res2);

  // Teste de formato errado (string e numero em campo de boolean)
  const res3 = await emitAsync("postNos", {
    id_corrida: idCorridaValido,
    id_celula: 1,
    n: "true", 
    s: 0,      
    l: true,
    o: false
  });
  assertValidationError("Teste 3 (Boolean inválido - boolean como string/número)", res3);

  // Teste de campo ausente
  const res4 = await emitAsync("post_posicao_atual", { 
    id_corrida: idCorridaValido
  });
  assertValidationError("Teste 4 (Campo Ausente - post_posicao_atual faltando)", res4);

  // Teste de campo que nao existe
  const res5 = await emitAsync("postFinish", { 
    id_corrida: idCorridaValido, 
    bateria_final: 7.8,
    campo_teste: "teste" 
  });
  assertValidationError("Teste 5 (Campo Extra - campo_teste)", res5);
  process.exit(0);
});