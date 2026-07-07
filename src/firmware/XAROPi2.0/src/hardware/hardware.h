#ifndef HARDWARE_H
#define HARDWARE_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>

// ==========================================
// MAPEAMENTO DE PINOS (Hardware Fixo)
// ==========================================
// Motores (Ponte H)
static const int PIN_IN1 = 20; // Motor Direito
static const int PIN_IN2 = 21; // Motor Direito
static const int PIN_IN3 = 16; // Motor Esquerdo
static const int PIN_IN4 = 17; // Motor Esquerdo

// Encoders (C1 Apenas)
static const int PIN_ENC_DIR = 7;
static const int PIN_ENC_ESQ = 2;

// Barramento I2C
static const int PIN_SDA = 9;
static const int PIN_SCL = 11;

// Controles XSHUT
static const int PIN_XSHUT_DIR = 45;
static const int PIN_XSHUT_ESQ = 41;

// ==========================================
// CONSTANTES GEOMÉTRICAS DO VEÍCULO
// ==========================================
const float DISTANCIA_CELULA_MM = 168.0;
extern float pulsosPorMM;
extern float fatorCorrecaoCurva;
extern const long PULSOS_CURVA_90_TEORICO;

// ==========================================
// VARIÁVEIS GLOBAIS COMPARTILHADAS (extern)
// ==========================================
extern volatile long contagemEncoderDir;
extern volatile long contagemEncoderEsq;
extern volatile int sentidoMotorDir;
extern volatile int sentidoMotorEsq;

// Sensores e Status de Inicialização
extern Adafruit_VL53L0X sensorFrontal;
extern Adafruit_VL53L0X sensorDireito;
extern Adafruit_VL53L0X sensorEsquerdo;

extern bool frontalOk;
extern bool direitoOk;
extern bool esquerdoOk;

// Endereços I2C Estáveis
const uint8_t ADDR_FRONTAL  = 0x29; // Padrão de hardware
const uint8_t ADDR_DIREITO  = 0x30;
const uint8_t ADDR_ESQUERDO = 0x31;

// Offsets Físicos (mm)
const float OFFSET_FRONTAL_MM  = 25.0;
const float OFFSET_DIREITO_MM  = 35.0;
const float OFFSET_ESQUERDO_MM = 25.0;

// ==========================================
// FUNÇÕES DO PACOTE DE HARDWARE
// ==========================================
void inicializarHardware();
void pararMotoresImediatamente();
float lerToF(Adafruit_VL53L0X &sensor, float offsetMM);

#endif // HARDWARE_H