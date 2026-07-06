#pragma once

// ─── Módulo: Controle dos Motores (L298N via PWM) ────────────────────────────
//
// RESPONSABILIDADE DESTE MÓDULO:
//   Executar os movimentos físicos decididos pelo Floodfill e atualizar:
//     robot.velocidade
//     robot.distancia
//
// O Floodfill atualiza robot.heading com a direção desejada.
// O MotorController deve girar e avançar conforme essa direção.
//
// TODO:
//   - Implementar MotorController.cpp com PWM via LEDC e controle por encoder
//   - Calibrar MS_FORWARD e MS_TURN_90 com o robô físico

namespace MotorController {
    void init();         // Configura pinos PWM e interrupções dos encoders
    void moveForward();  // Avança uma célula (~18cm)
    void turnRight();    // Gira 90° à direita
    void turnLeft();     // Gira 90° à esquerda
    void stop();
}
