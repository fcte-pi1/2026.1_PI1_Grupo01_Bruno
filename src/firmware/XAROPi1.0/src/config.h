#pragma once
#include <Arduino.h>

// ─── Rede ─────────────────────────────────────────────────────────────────────
#define WIFI_SSID       "ESP32_S3_WIFI"
#define WIFI_PASSWORD   "senha_segura_123"
#define BACKEND_HOST    "192.168.4.2"
#define BACKEND_PORT    3000
#define WS_PATH         "/socket.io/?EIO=4&transport=websocket&role=esp32"

// ─── Labirinto ────────────────────────────────────────────────────────────────
#define MAZE_SIZE       16
#define TOTAL_CELLS     (MAZE_SIZE * MAZE_SIZE)

#define DIR_NORTH       0
#define DIR_EAST        1
#define DIR_SOUTH       2
#define DIR_WEST        3

#define WALL_NORTH      0x01
#define WALL_EAST       0x02
#define WALL_SOUTH      0x04
#define WALL_WEST       0x08

// ─── Timing ───────────────────────────────────────────────────────────────────
#define STEP_INTERVAL_MS      1000   // Intervalo entre passos do Floodfill
#define TELEMETRY_INTERVAL_MS  200   // Intervalo de envio de telemetria (5 Hz)

// =============================================================================
// Estado global compartilhado entre todos os módulos.
//
// REGRA: cada módulo escreve APENAS no seu bloco. Nunca no bloco alheio.
//   - WebSocketManager  → controle (corridaAtiva, idCorrida)
//   - Floodfill         → navegação (posX, posY, heading, maze, distances)
//   - IRSensors (TODO)  → sensores (wallFront, wallRight, wallLeft)
//   - MotorController   → odometria (velocidade, distancia)
//   - BatteryMonitor    → bateria (tensao, corrente, mahRestante)
// =============================================================================
struct RobotState {

    // — Controle de corrida (WebSocketManager) —
    bool    corridaAtiva   = false;
    String  idCorrida      = "";

    // — Navegação (Floodfill) —
    int     posX           = 0;
    int     posY           = 0;
    int     heading        = DIR_NORTH;
    bool    chegouAoCentro = false;
    uint8_t maze[MAZE_SIZE][MAZE_SIZE]      = {};
    uint8_t distances[MAZE_SIZE][MAZE_SIZE] = {};

    // — Sensores de parede (IRSensors — a implementar) —
    bool    wallFront      = false;
    bool    wallRight      = false;
    bool    wallLeft       = false;

    // — Odometria (MotorController — a implementar) —
    float   velocidade     = 0.0f;   // m/s
    float   distancia      = 0.0f;   // metros

    // — Bateria (BatteryMonitor — a implementar) —
    float   tensao         = 7.4f;   // V
    float   corrente       = 0.0f;   // mA
    int     mahRestante    = 1000;
};

// Instância única definida em main.cpp, acessível por todos via extern
extern RobotState robot;
