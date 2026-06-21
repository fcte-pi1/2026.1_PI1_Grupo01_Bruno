#pragma once

// Algoritmo Flood Fill.
//
// O while(true) do algoritmo original foi substituído por step(), que executa um ciclo
// completo por chamada: lê robot.wall* → atualiza robot.maze →
// recalcula robot.distances → move (via robot.posX/Y/heading).
//
// Isso libera o loop() principal para manter o WebSocket ativo entre passos.
//
// antes de chamar step(), o módulo de sensores (IRSensors)
// deve ter atualizado robot.wallFront / robot.wallRight / robot.wallLeft.

namespace Floodfill {
    void init();      // Reseta maze, distances e posição — chamar no setup()
    void step();      // Executa um passo — chamar a cada STEP_INTERVAL_MS
    bool finished();  // true quando robot.distances[posX][posY] == 0
}
