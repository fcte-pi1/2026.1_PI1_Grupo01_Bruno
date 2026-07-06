#include "IRSensors.h"
#include <Wire.h>
#include <VL53L0X.h>
#include "../../config.h"

// As pinagens devem ser conferidas
#define I2C_SDA 8
#define I2C_SCL 13

#define XSHUT_ESQ  10
#define XSHUT_FRON 11
#define XSHUT_DIR  12

// Endereços de cada sensor 
#define ADDR_ESQ  0x30
#define ADDR_FRON 0x31
#define ADDR_DIR  0x32

// Limiares de distância em MM
#define THRESHOLD_PAREDE_FRONTIER 150 
#define THRESHOLD_PAREDE_LATERAL  130 

// Instâncias dos sensores restritas a este arquivo
static VL53L0X sensorEsq;
static VL53L0X sensorFron;
static VL53L0X sensorDir;

namespace IRSensors {

    void init() {
        // Inicializa o barramento I2C
        if (!Wire.begin(I2C_SDA, I2C_SCL, 400000)) {
            Serial.println("[IRSensors] Erro crítico: Falha ao iniciar o barramento I2C!");
            while(1);
        }

        // Configura os pinos XSHUT
        pinMode(XSHUT_ESQ, OUTPUT);
        pinMode(XSHUT_FRON, OUTPUT);
        pinMode(XSHUT_DIR, OUTPUT);
        
        // Aplica um Reset físico mantendo as linhas em LOW
        digitalWrite(XSHUT_ESQ, LOW);
        digitalWrite(XSHUT_FRON, LOW);
        digitalWrite(XSHUT_DIR, LOW);
        delay(20);

        // Inicialização Sequencial e Atribuição de Endereços
        // --- Sensor Esquerdo ---
        digitalWrite(XSHUT_ESQ, HIGH); 
        delay(10);
        if (!sensorEsq.init()) { Serial.println("[IRSensors] Erro: ToF Esquerdo não respondeu!"); while(1); }
        sensorEsq.setAddress(ADDR_ESQ);
        sensorEsq.setTimeout(200);
        sensorEsq.startContinuous();

        // --- Sensor Frontal ---
        digitalWrite(XSHUT_FRON, HIGH); 
        delay(10);
        if (!sensorFron.init()) { Serial.println("[IRSensors] Erro: ToF Frontal não respondeu!"); while(1); }
        sensorFron.setAddress(ADDR_FRON);
        sensorFron.setTimeout(200);
        sensorFron.startContinuous();

        // --- Sensor Direito ---
        digitalWrite(XSHUT_DIR, HIGH); 
        delay(10);
        if (!sensorDir.init()) { Serial.println("[IRSensors] Erro: ToF Direito não respondeu!"); while(1); }
        sensorDir.setAddress(ADDR_DIR);
        sensorDir.setTimeout(200);
        sensorDir.startContinuous();

        Serial.println("[IRSensors] Inicialização dos ToFs concluída.");
    }

    void read() {
        // Efetua a leitura contínua dos sensores em milímetros
        uint16_t distEsq  = sensorEsq.readRangeContinuousMillimeters();
        uint16_t distFron = sensorFron.readRangeContinuousMillimeters();
        uint16_t distDir  = sensorDir.readRangeContinuousMillimeters();

        // Filtra erros e aplica o offset de -20mm
        int16_t esq  = (sensorEsq.timeoutOccurred()  || distEsq  >= 8190) ? 999 : (distEsq - 20);
        int16_t fron = (sensorFron.timeoutOccurred() || distFron >= 8190) ? 999 : (distFron - 20);
        int16_t dir  = (sensorDir.timeoutOccurred()  || distDir  >= 8190) ? 999 : (distDir - 20);

        robot.wallLeft  = (esq  < THRESHOLD_PAREDE_LATERAL);
        robot.wallFront = (fron < THRESHOLD_PAREDE_FRONTIER);
        robot.wallRight = (dir  < THRESHOLD_PAREDE_LATERAL);
    }
}