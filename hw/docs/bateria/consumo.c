#include "consumo.h"
#include "bateria.h"
#include <Arduino.h>

#define PINO_ADC_M1   7
#define PINO_ADC_M2   18
#define R_SHUNT       0.22f
#define VREF          3.3f
#define RESOLUCAO_ADC 10

static float corrente_m1  = 0.0f;
static float corrente_m2  = 0.0f;
static float potencia     = 0.0f;
static float energia_wh   = 0.0f;
static unsigned long ultimo_tempo = 0;

void consumo_init(void) {
    analogReadResolution(RESOLUCAO_ADC);
    ultimo_tempo = millis();
}

static float adc_para_corrente(int pino) {
    int leitura = analogRead(pino);
    float v_shunt = (leitura / 1023.0f) * VREF;
    return v_shunt / R_SHUNT;
}

void consumo_atualizar(void) {
    corrente_m1 = adc_para_corrente(PINO_ADC_M1);
    corrente_m2 = adc_para_corrente(PINO_ADC_M2);

    float corrente_total = corrente_m1 + corrente_m2;
    float vbat = bateria_get_tensao();

    potencia = corrente_total * vbat;

    unsigned long agora = millis();
    float delta_h = (agora - ultimo_tempo) / 3600000.0f;
    energia_wh += potencia * delta_h;
    ultimo_tempo = agora;
}

float consumo_get_corrente_m1(void)  { return corrente_m1; }
float consumo_get_corrente_m2(void)  { return corrente_m2; }
float consumo_get_potencia(void)     { return potencia; }
float consumo_get_energia_wh(void)   { return energia_wh; }