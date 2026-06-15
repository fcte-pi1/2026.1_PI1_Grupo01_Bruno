#include <stdint.h>
#include <stdbool.h>

#define PINO_ADC_BATERIA  1
#define TAMANHO_JANELA    10
#define RESOLUCAO_ADC     10
#define VREF              3.3f
#define R1                220000.0f
#define R2                100000.0f
#define FATOR_DIVISOR     ((R1 + R2) / R2)
#define TENSAO_CRITICA_V  6.4f

static float tensao_bateria = 0.0f;
static int   leituras[TAMANHO_JANELA] = {0};
static int   indice_leitura = 0;

float ler_tensao_bateria(void) {
    leituras[indice_leitura] = analogRead(PINO_ADC_BATERIA);
    indice_leitura = (indice_leitura + 1) % TAMANHO_JANELA;

    long soma = 0;
    for (int i = 0; i < TAMANHO_JANELA; i++) soma += leituras[i];
    float media_digital = soma / (float)TAMANHO_JANELA;

    float v_adc = (media_digital / (float)((1 << RESOLUCAO_ADC) - 1)) * VREF;
    return v_adc * FATOR_DIVISOR;
}

bool bateria_critica(void) {
    return tensao_bateria <= TENSAO_CRITICA_V;
}