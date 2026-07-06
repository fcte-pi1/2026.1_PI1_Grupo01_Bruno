#pragma once
#include <Arduino.h>

// Gerencia toda a comunicação Socket.IO com o backend NestJS:
//   - Cria o AP Wi-Fi e o servidor HTTP de monitoramento
//   - Mantém a conexão WebSocket com handshake e heartbeat
//   - Recebe comandos do backend e atualiza robot.corridaAtiva / robot.idCorrida
//   - Expõe funções de emissão de telemetria para o main.cpp usar

namespace WebSocketManager {

    // Chame uma vez no setup()
    void init();

    // Chame a cada iteração do loop() — mantém WS e HTTP vivos
    void loop();

    // Adiciona uma linha no log da página web (192.168.4.1)
    void log(const String& msg);

    // ── Emissores de telemetria ──────────────────────────────────────────────
    // Chamados pelo main.cpp após cada passo do Floodfill
    void emitPosicao();   // Usa robot.posX, robot.posY
    void emitNos();       // Usa robot.maze[posX][posY]
    void emitVelBat();    // Usa robot.velocidade, robot.tensao, robot.mahRestante...
    void emitFinish();    // Chamado quando Floodfill::finished() == true
}
