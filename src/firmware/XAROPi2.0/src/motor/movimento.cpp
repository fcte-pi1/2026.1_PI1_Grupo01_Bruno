#include "movimento.h"

void motorFrente(int pwm) {
    sentidoMotorDir = 1; sentidoMotorEsq = 1;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, pwm);
    analogWrite(PIN_IN3, pwm); analogWrite(PIN_IN4, 0);
}

void motorFrenteAjustado(int pwmDir, int pwmEsq) {
    sentidoMotorDir = 1; sentidoMotorEsq = 1;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, pwmDir);
    analogWrite(PIN_IN3, pwmEsq); analogWrite(PIN_IN4, 0);
}

void motorRe(int pwm) {
    sentidoMotorDir = -1; sentidoMotorEsq = -1;
    analogWrite(PIN_IN1, pwm); analogWrite(PIN_IN2, 0);
    analogWrite(PIN_IN3, 0); analogWrite(PIN_IN4, pwm);
}

void motorFreio() {
    sentidoMotorDir = 0; sentidoMotorEsq = 0;
    analogWrite(PIN_IN1, 255); analogWrite(PIN_IN2, 255);
    analogWrite(PIN_IN3, 255); analogWrite(PIN_IN4, 255);
    delay(100); 
    motorStandby();
}

void motorStandby() {
    sentidoMotorDir = 0; sentidoMotorEsq = 0;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, 0);
    analogWrite(PIN_IN3, 0); analogWrite(PIN_IN4, 0);
}

void pivoEsquerda(int pwm) {
    sentidoMotorDir = 1; sentidoMotorEsq = 0;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, pwm);
    analogWrite(PIN_IN3, 255); analogWrite(PIN_IN4, 255);
}

void pivoDireita(int pwm) {
    sentidoMotorDir = 0; sentidoMotorEsq = 1;
    analogWrite(PIN_IN1, 255); analogWrite(PIN_IN2, 255);
    analogWrite(PIN_IN3, pwm); analogWrite(PIN_IN4, 0);
}

void spinEsquerda(int pwm) {
    sentidoMotorDir = 1; sentidoMotorEsq = -1;
    analogWrite(PIN_IN1, 0); analogWrite(PIN_IN2, pwm);
    analogWrite(PIN_IN3, 0); analogWrite(PIN_IN4, pwm);
}

void spinDireita(int pwm) {
    sentidoMotorDir = -1; sentidoMotorEsq = 1;
    analogWrite(PIN_IN1, pwm); analogWrite(PIN_IN2, 0);
    analogWrite(PIN_IN3, pwm); analogWrite(PIN_IN4, 0);
}

bool girar90(int pwm, bool paraDireita, int graus) {
    contagemEncoderEsq = 0;
    contagemEncoderDir = 0;
    
    long alvo90 = (long)(PULSOS_CURVA_90_TEORICO * fatorCorrecaoCurva);
    long alvo = (long)((float)graus / 90.0f * (float)alvo90);

    if (alvo <= 0) {
        return false;
    }

    if (paraDireita) {
        spinDireita(pwm);
    } else {
        spinEsquerda(pwm);
    }

    while (true) {
        extern volatile bool pararAgora;
        if (pararAgora) {
            motorFreio();
            return false;
        }

        long mediaAtual = (abs(contagemEncoderEsq) + abs(contagemEncoderDir)) / 2;
        if (mediaAtual >= alvo) {
            break;
        }
        delay(2);
    }

    motorFreio();
    return true;
}

bool avancaPorPulsos(int pwm, long pulsosAlvo, bool ignorarCorrecao) {
    contagemEncoderEsq = 0;
    contagemEncoderDir = 0;

    unsigned long tempoUltimoMovimento = millis();
    long mediaAnterior = 0;

    motorFrente(pwm);

    while (true) {
        extern volatile bool pararAgora;
        if (pararAgora) { motorFreio(); return false; }

        long mediaAtual = (abs(contagemEncoderEsq) + abs(contagemEncoderDir)) / 2;

        if (mediaAtual > mediaAnterior) {
            tempoUltimoMovimento = millis();
            mediaAnterior = mediaAtual;
        } else if (millis() - tempoUltimoMovimento > 300) {
            motorFreio();
            return false;
        }

        if (mediaAtual >= pulsosAlvo) break;

        float distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);
        if (distF > 0 && distF < 28.0) {
            motorFreio();
            return false;
        }

        if (!ignorarCorrecao) {
            float distE = lerToF(sensorEsquerdo, OFFSET_ESQUERDO_MM);
            float distD = lerToF(sensorDireito, OFFSET_DIREITO_MM);

            if (distE > 0 && distE < 120.0 && distD > 0 && distD < 120.0) {
                float erro = distE - distD;
                int ajuste = (int)(erro * 0.60);
                int pwmDir = constrain(pwm + ajuste, 0, 255);
                int pwmEsq = constrain(pwm - ajuste, 0, 255);
                motorFrenteAjustado(pwmDir, pwmEsq);
            } else {
                motorFrente(pwm);
            }
        } else {
            motorFrente(pwm);
        }

        delay(5);
    }

    motorFreio();
    return true;
}

bool avancaCelula(int pwm, bool ignorarCorrecao) {
    contagemEncoderEsq = 0;
    contagemEncoderDir = 0;

    long pulsosAlvo = (long)(150.0 * pulsosPorMM);

    unsigned long tempoUltimoMovimento = millis();
    long mediaAnterior = 0;

    motorFrente(pwm);

    while (true) {
        extern volatile bool pararAgora;
        if (pararAgora) { motorFreio(); return false; }

        long mediaAtual = (abs(contagemEncoderEsq) + abs(contagemEncoderDir)) / 2;

        if (mediaAtual > mediaAnterior) {
            tempoUltimoMovimento = millis(); 
            mediaAnterior = mediaAtual;
        } else if (millis() - tempoUltimoMovimento > 300) {
            Serial.println("[NAV] FAIIL: Estol detectado.");
            motorFreio();
            return false; 
        }

        if (mediaAtual >= pulsosAlvo) break;

        // Sensor Frontal atuando como parachoque
        float distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);
        if (distF > 0 && distF < 28.0) {
            motorFreio();
            return false;
        }

        // Correção de alinhamento por ToFs Laterais
        if (!ignorarCorrecao) {
            float distE = lerToF(sensorEsquerdo, OFFSET_ESQUERDO_MM);
            float distD = lerToF(sensorDireito, OFFSET_DIREITO_MM);

            if (distE > 0 && distE < 120.0 && distD > 0 && distD < 120.0) {
                float erro = distE - distD; 
                
                int ajuste = (int)(erro * 0.60); 
                
                int pwmDir = constrain(pwm + ajuste, 0, 255);
                int pwmEsq = constrain(pwm - ajuste, 0, 255);
                motorFrenteAjustado(pwmDir, pwmEsq);
            } else {
                motorFrente(pwm); 
            }
        } else {
            motorFrente(pwm);
        }

        delay(5);
    }

    motorFreio(); 
    return true; 
}