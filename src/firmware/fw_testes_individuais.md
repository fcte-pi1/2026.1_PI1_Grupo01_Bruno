# DOCUMENTAÇÃO DE TESTES INDIVIDUAIS DE FIRMWARE

Este documento descreve as rotinas e os códigos utilizados para validar o funcionamento individual de cada componente de hardware (microcontrolador, sensores, atuadores) antes da integração final do sistema. Também objetiva auxiliar a equipe de firmware na integração dos códigos de cada sensor/atuador ao firmware com o algoritmo de resolução do labirinto.

---

## Índice
1. [Componente A: ESP32-S3](esp32_s3)
2. [Componente B: MPU6050](mpu6050)
3. [Componente C: ToF VL53L0X](tof)

---

## 1. Componente A: ESP32-S3

**Objetivo:** Validar o comportamento do microcontrolador com aplicação do multicore via FreeRTOS e saída serial. 

### O código

```cpp
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
```

### Resultados esperados
- O monitor serial deve ser configurado em **115200 baud rate**;
- Após 3 segundos de inicialização, a mensagem `"--- Iniciando Teste de Diagnóstico da ESP32-S3 ---"` deve aparecer;
- A cada segundo, o serial vai exibir leituras contínuas relatando o funcionamento do core 0 e do core 1.

---

## 2. Componente B (MPU6050)

**Objetivo:** Validar o comportamento da MPU-6050 com monitoramento em tempo real dos dados de saída nos eixos X, Y e Z.

### O código

```cpp

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// Definição explícita dos pinos I2C para o ESP32-S3
#define SDA_PIN 8
#define SCL_PIN 9

Adafruit_MPU6050 mpu;

void setup(void) {
	Serial.begin(115200);
	delay(3000); // Dá tempo para o USB CDC (Nativo do S3) inicializar no PC

	Serial.println("Inicializando MPU6050");

	// Inicializa o barramento I2C nos pinos específicos do S3
	Wire.begin(SDA_PIN, SCL_PIN);

	if (!mpu.begin()) {
	Serial.println("Falha ao encontrar o MPU6050. Verifique as conexões SDA(8) e SCL(9)!");
	while (1) { delay(10); }
	}
	Serial.println("MPU6050 Encontrado!");

	mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
	mpu.setGyroRange(MPU6050_RANGE_500_DEG);
	mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
	sensors_event_t a, g, temp;
	mpu.getEvent(&a, &g, &temp);

	Serial.print("Aceleração X: "); Serial.print(a.acceleration.x);
	Serial.print(", Y: "); Serial.print(a.acceleration.y);
	Serial.print(", Z: "); Serial.print(a.acceleration.z);
	Serial.println(" m/s^2");

	Serial.println("---");
	delay(500);
}

```

### Resultados esperados

- O monitor serial deve ser configurado em **115200 baud rate**;
- Após 3 segundos da inicialização, o serial irá exibir `"Inicializando MPU6050"`, seguido por `"MPU6050 Encontrado!"`;
- A cada 500ms, o serial exibirá as leituras de aceleração de todos os eixos;
- Com o leitor deitado sobre a mesa, a leitura deve marcar aproximadamente 9.8 no eixo Z, enquanto marca aproximadamente 0 nos demais eixos. 

---

## 3. Componente C (ToF VL53L0X)

**Objetivo:** Validar o comportamento do sensor ToF com monitoramento em tempo real dos dados de distância.

### O código

```cpp

#include <Wire.h>
#include <Adafruit_VL53L0X.h>

#define SDA_PIN 8
#define SCL_PIN 9

Adafruit_VL53L0X lox = Adafruit_VL53L0X();

void setup() {
	Serial.begin(115200);
	delay(3000);

	Serial.println("Inicializando VL53L0X...");
	
	Wire.begin(SDA_PIN, SCL_PIN);
	
	if (!lox.begin()) {
		Serial.println("Falha ao iniciar o VL53L0X. Verifique SDA(8) e SCL(9).");
		while(1);
	}
	Serial.println("VL53L0X Iniciado com sucesso!");
}

void loop() {
	VL53L0X_RangingMeasurementData_t measure;
	
	lox.rangingTest(&measure, false); 

	if (measure.RangeStatus != 4) { 
		Serial.print("Distância: "); 
		Serial.print(measure.RangeMilliMeter);
		Serial.println(" mm");
	} else {
		Serial.println("Fora de alcance");
	}
		
	delay(250);
}

```

### Resultados esperados

- O monitor serial deve estar configurado em **115200 baud rate**;
- Após 3 segundos, o sistema deve exibir `"Inicializando VL53L0X..."`, seguido por `"VL53L0X Iniciado com sucesso!"`;
- A cada 250ms, o serial atualizará as leituras com a indicação da distância;
- Por se tratar de impressões no serial em tempo real, ao variar a distância do objeto em frente ao sensor, a impressão no serial deve acompanhar a variação;
- Ao apontar o sensor para um espaço vazio (até 1.5m), o serial deve imprimir `"Fora de alcance"`.
