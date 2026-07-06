#ifndef MOVIMENTO_H
#define MOVIMENTO_H

#include <Arduino.h>
#include "hardware/hardware.h"

void motorFrente(int pwm);
void motorFrenteAjustado(int pwmDir, int pwmEsq); 
void motorRe(int pwm);
void motorFreio();
void motorStandby();

void pivoEsquerda(int pwm);
void pivoDireita(int pwm);
void spinEsquerda(int pwm);
void spinDireita(int pwm);

bool girar90(int pwm, bool paraDireita, int graus = 90);
bool avancaPorPulsos(int pwm, long pulsosAlvo, bool ignorarCorrecao = false);

bool avancaCelula(int pwm, bool ignorarCorrecao = false);

#endif // MOVIMENTO_H