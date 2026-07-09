#include <Arduino.h>

// Tarefa dedicada ao Core 0 (Ideal para leitura rápida de sensores I2C)
void taskCore0(void * pvParameters) {
for(;;) {
	Serial.print("Ping do Core 0! Processador rodando perfeitamente. ID: ");
	Serial.println(xPortGetCoreID());
	vTaskDelay(pdMS_TO_TICKS(1000)); // Delay não-bloqueante do FreeRTOS
}
}

// Tarefa dedicada ao Core 1 (Ideal para PID e controle da Ponte H)
void taskCore1(void * pvParameters) {
  for(;;) {
	Serial.print("Pong do Core 1! Processador rodando perfeitamente. ID: ");
	Serial.println(xPortGetCoreID());
	vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void setup() {
  Serial.begin(115200);
  
  // O ESP32-S3 usa Native USB na maioria das placas. 
  // Esse delay garante que a porta serial do PC tenha tempo de conectar.
  delay(3000); 

  Serial.println("--- Iniciando Teste de Diagnóstico da ESP32-S3 ---");

  // Cria e fixa a tarefa no Core 0
  xTaskCreatePinnedToCore(
	taskCore0,	   /* Função que implementa a tarefa */
	"Tarefa_Sensores",/* Nome para debug */
	10000,		   /* Tamanho da stack em bytes */
	NULL,			/* Parâmetros passados para a tarefa */
	1,			   /* Prioridade (1 é a padrão) */
	NULL,			/* Handle da tarefa (não usado aqui) */
	0);			  /* Fixar no Core 0 */

  // Cria e fixa a tarefa no Core 1
  xTaskCreatePinnedToCore(
	taskCore1,	   
	"Tarefa_Motores", 
	10000,		   
	NULL,			
	1,			   
	NULL,			
	1);			  /* Fixar no Core 1 */
}

void loop() {
  // Como as tarefas gerenciam o processamento, deletamos o loop padrão
  // para liberar totalmente os recursos do Core 1 (onde o loop costuma rodar).
  vTaskDelete(NULL); 
} 