#include "bateria.h"
#include <stdint.h>
#include <Arduino.h>  // necessário para analogRead e analogReadResolution

// pino e configurações do ADC
#define PINO_ADC_BATERIA  1
#define TAMANHO_JANELA    10
#define RESOLUCAO_ADC     10      // 10 bits → valores de 0 a 1023
#define VREF              3.3f    // tensão de referência do ESP32-S3

// divisor resistivo 220k/100k na frente do pino ADC
#define R1                220000.0f
#define R2                100000.0f
#define FATOR_DIVISOR     ((R1 + R2) / R2)  // = 3.2

// limiar crítico: 3.2V por célula × 2 células (bateria 2S)
#define TENSAO_CRITICA_V  6.4f

// buffer circular para média móvel
static int   leituras[TAMANHO_JANELA] = {0};
static int   indice_leitura = 0;
static float tensao_bateria = 0.0f;

// configura a resolução do ADC
void bateria_init(void) {
    analogReadResolution(RESOLUCAO_ADC);
}

float ler_tensao_bateria(void) {
    // adiciona nova leitura no buffer circular
    leituras[indice_leitura] = analogRead(PINO_ADC_BATERIA);
    indice_leitura = (indice_leitura + 1) % TAMANHO_JANELA;

    // calcula média das últimas 10 leituras
    long soma = 0;
    for (int i = 0; i < TAMANHO_JANELA; i++) soma += leituras[i];
    float media_digital = soma / (float)TAMANHO_JANELA;

    // converte digital → tensão no pino (0–1023 → 0–3.3V)
    float v_adc = (media_digital / (float)((1 << RESOLUCAO_ADC) - 1)) * VREF;

    // compensa o divisor resistivo para obter a tensão real da bateria
    tensao_bateria = v_adc * FATOR_DIVISOR;

    return tensao_bateria;
}

// retorna o último valor calculado sem fazer nova leitura
float bateria_get_tensao(void) {
    return tensao_bateria;
}

// verifica se a tensão está abaixo do limiar crítico (RNF5)
bool bateria_critica(void) {
    return tensao_bateria <= TENSAO_CRITICA_V;
}