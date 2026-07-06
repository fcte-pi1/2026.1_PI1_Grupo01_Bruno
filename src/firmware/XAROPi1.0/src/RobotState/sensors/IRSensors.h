#pragma once

// ─── Módulo: Leitura dos Sensores de Parede (VL53L0X via I2C) ────────────────
//
// RESPONSABILIDADE DESTE MÓDULO:
//   Ler os sensores ToF e atualizar no RobotState:
//     robot.wallFront
//     robot.wallRight
//     robot.wallLeft
//
// O Floodfill::step() consome esses valores — ele deve ser chamado
// DEPOIS de IRSensors::read() em cada ciclo.
//
// TODO:
//   - Implementar IRSensors.cpp com leitura real dos VL53L0X (TOF)
//   - Definir o limiar de distância que configura uma parede (ex: 80mm, 100mm, etc)

namespace IRSensors {
    void init();   // Inicializa I2C e os sensores
    void read();   // Atualiza robot.wallFront / wallRight / wallLeft
}
