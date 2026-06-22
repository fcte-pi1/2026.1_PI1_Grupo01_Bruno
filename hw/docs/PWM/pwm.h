#ifndef PWM_H
#define PWM_H

#include <stdint.h>

void pwm_init(void);
void pwm_set_esquerdo(uint8_t duty);  // 0-255
void pwm_set_direito(uint8_t duty);

#endif