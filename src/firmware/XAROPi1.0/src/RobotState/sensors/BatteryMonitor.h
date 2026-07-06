#pragma once

// ─── Módulo: Leitura da Bateria ───────────────────────────────────────────────
//
// RESPONSABILIDADE DESTE MÓDULO:
//   Ler tensão e corrente do hardware e atualizar no RobotState:
//     robot.tensao       (V)
//     robot.corrente     (mA)
//     robot.mahRestante
//
// O WebSocketManager::emitVelBat() já envia esses valores automaticamente
// a cada TELEMETRY_INTERVAL_MS — nenhuma chamada extra necessária.
//
// TODO:
//   - Implementar BatteryMonitor.cpp com leitura real do hardware
//   - Remover a simulação `robot.mahRestante -= 5` do main.cpp ao integrar

namespace BatteryMonitor {
    void init();   // Configura pino analógico ou I2C do sensor de bateria
    void read();   // Atualiza robot.tensao / robot.corrente / robot.mahRestante
}
