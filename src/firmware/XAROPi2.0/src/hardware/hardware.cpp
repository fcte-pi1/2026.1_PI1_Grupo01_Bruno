#include "hardware.h"

volatile long contagemEncoderDir = 0;
volatile long contagemEncoderEsq = 0;
volatile int sentidoMotorDir = 0;
volatile int sentidoMotorEsq = 0;

const float DIAMETRO_RODA_MM = 32.0; 
const int PULSOS_POR_VOLTA = 145;    

float pulsosPorMM = (float)PULSOS_POR_VOLTA / (PI * DIAMETRO_RODA_MM);

float fatorCorrecaoCurva = 1.00;
const float WHEELBASE_MM = 100.0;
const long PULSOS_CURVA_90_TEORICO = (long)(((PI / 2.0) * WHEELBASE_MM / 2.0) * pulsosPorMM);

Adafruit_VL53L0X sensorFrontal  = Adafruit_VL53L0X();
Adafruit_VL53L0X sensorDireito  = Adafruit_VL53L0X();
Adafruit_VL53L0X sensorEsquerdo = Adafruit_VL53L0X();

bool frontalOk  = false;
bool direitoOk  = false;
bool esquerdoOk = false;


void IRAM_ATTR lerEncoderDir() {
    contagemEncoderDir += sentidoMotorDir;
}

void IRAM_ATTR lerEncoderEsq() {
    contagemEncoderEsq += sentidoMotorEsq;
}


void inicializarHardware() {
    pinMode(PIN_IN1, OUTPUT); pinMode(PIN_IN2, OUTPUT);
    pinMode(PIN_IN3, OUTPUT); pinMode(PIN_IN4, OUTPUT);
    pararMotoresImediatamente();

    pinMode(PIN_ENC_DIR, INPUT_PULLUP);
    pinMode(PIN_ENC_ESQ, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(PIN_ENC_DIR), lerEncoderDir, RISING);
    attachInterrupt(digitalPinToInterrupt(PIN_ENC_ESQ), lerEncoderEsq, RISING);

    pinMode(PIN_XSHUT_DIR, OUTPUT);
    pinMode(PIN_XSHUT_ESQ, OUTPUT);
    digitalWrite(PIN_XSHUT_DIR, LOW);
    digitalWrite(PIN_XSHUT_ESQ, LOW);
    delay(60); // Assegura descarga dos capacitores das placas

    Wire.begin(PIN_SDA, PIN_SCL);
    Wire.setClock(100000);

    Wire.beginTransmission(0x35);
    if (Wire.endTransmission() == 0) {
        Wire.beginTransmission(0x35);
        Wire.write(0x8A); 
        Wire.write(0x29); 
        Wire.endTransmission();
        delay(30);
    }

    if (!sensorFrontal.begin(0x35, false, &Wire)) {
        Serial.println("[HAL ERR] Falha no ToF FRONTAL (0x35)");
        frontalOk = false;
    } else {
        Serial.println("[HAL OK] ToF FRONTAL pronto em 0x35");
        frontalOk = true;
    }

    digitalWrite(PIN_XSHUT_DIR, HIGH);
    delay(30);
    if (!sensorDireito.begin(ADDR_DIREITO, false, &Wire)) {
        Serial.println("[HAL ERR] Falha no ToF DIREITO (0x30)");
        direitoOk = false;
    } else {
        Serial.println("[HAL OK] ToF DIREITO pronto em 0x30");
        direitoOk = true;
    }

    digitalWrite(PIN_XSHUT_ESQ, HIGH);
    delay(30);
    if (!sensorEsquerdo.begin(ADDR_ESQUERDO, false, &Wire)) {
        Serial.println("[HAL ERR] Falha no ToF ESQUERDO (0x31)");
        esquerdoOk = false;
    } else {
        Serial.println("[HAL OK] ToF ESQUERDO pronto em 0x31");
        esquerdoOk = true;
    }
}

void pararMotoresImediatamente() {
    sentidoMotorDir = 0; sentidoMotorEsq = 0;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, 0);
    analogWrite(PIN_IN3, 0); analogWrite(PIN_IN4, 0);
}

float lerToF(Adafruit_VL53L0X &sensor, float offsetMM) {
    VL53L0X_RangingMeasurementData_t medida;
    sensor.rangingTest(&medida, false);
    if (medida.RangeStatus != 4) {
        return (float)medida.RangeMilliMeter - offsetMM;
    }
    return -1.0; // Código de erro padrão
}