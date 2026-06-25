#ifndef CONSUMO_H
#define CONSUMO_H

#include <stdint.h>

void  consumo_init(void);
void  consumo_atualizar(void);
float consumo_get_corrente_m1(void);
float consumo_get_corrente_m2(void);
float consumo_get_potencia(void);
float consumo_get_energia_wh(void);

#endif