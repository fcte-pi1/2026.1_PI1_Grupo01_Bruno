#ifndef BATERIA_H
#define BATERIA_H

#include <stdbool.h>

void  bateria_init(void);        // configura o ADC
float ler_tensao_bateria(void);  // lê, calibra e retorna a tensão da bateria
float bateria_get_tensao(void);  // retorna o último valor calculado
bool  bateria_critica(void);     // retorna true se tensão <= 6.4V

#endif