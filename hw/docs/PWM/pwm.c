#include "pwm.h"
#include <Arduino.h>

#define PINO_MOTOR_ESQUERDO  13
#define PINO_MOTOR_DIREITO   14
#define CANAL_ESQUERDO       0
#define CANAL_DIREITO        1
#define PWM_FREQUENCIA       5000
#define PWM_RESOLUCAO        8    // 8 bits = 0-255

void pwm_init(void) {
    ledcSetup(CANAL_ESQUERDO, PWM_FREQUENCIA, PWM_RESOLUCAO);
    ledcAttachPin(PINO_MOTOR_ESQUERDO, CANAL_ESQUERDO);

    ledcSetup(CANAL_DIREITO, PWM_FREQUENCIA, PWM_RESOLUCAO);
    ledcAttachPin(PINO_MOTOR_DIREITO, CANAL_DIREITO);
}

void pwm_set_esquerdo(uint8_t duty) {
    ledcWrite(CANAL_ESQUERDO, duty);
}

void pwm_set_direito(uint8_t duty) {
    ledcWrite(CANAL_DIREITO, duty);
}