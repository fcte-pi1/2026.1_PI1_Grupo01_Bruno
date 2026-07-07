#include <Arduino.h>
#include "config.h"
#include "RobotState/comm/WebSocketManager.h"
#include "RobotState/navigation/Floodfill.h"

// #include "sensors/BatteryMonitor.h"
// #include "sensors/IRSensors.h"
// #include "motors/MotorController.h"


// ─── Instância global do estado compartilhado ─────────────────────────────────
RobotState robot;

// ─── Timers ───────────────────────────────────────────────────────────────────
static unsigned long lastStepMs      = 0;
static unsigned long lastTelemetryMs = 0;

void setup() {
    WebSocketManager::init();
    Floodfill::init();

    // IRSensors::init();      // TODO: descomentar quando pronto
    // MotorController::init(); // TODO: descomentar quando pronto
}

void loop() {
    WebSocketManager::loop();

    if (!robot.corridaAtiva) return;

    unsigned long now = millis();

    // Um passo do Floodfill a cada STEP_INTERVAL_MS
    if (now - lastStepMs >= STEP_INTERVAL_MS) {
        lastStepMs = now;

        if (Floodfill::finished()) {
            robot.corridaAtiva    = false;
            robot.chegouAoCentro  = true;
            WebSocketManager::emitFinish();
            WebSocketManager::log("🏁 Centro alcançado!");
            return;
        }

        // TODO: descomentar quando IRSensors estiver pronto
        // IRSensors::read();  // Atualiza robot.wallFront/Right/Left

        // Simulação temporária de paredes (remover quando IRSensors estiver pronto)
        robot.wallFront = false;
        robot.wallRight = false;
        robot.wallLeft  = false;

        Floodfill::step();

        // TODO: descomentar quando MotorController estiver pronto
        // MotorController::moveForward(); — o Floodfill já calcula heading,
        // o MotorController só precisa executar fisicamente

        // Simula queda de bateria (remover quando BatteryMonitor estiver pronto)
        robot.mahRestante -= 5;
    }

    // Telemetria a cada TELEMETRY_INTERVAL_MS
    if (now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryMs = now;
        WebSocketManager::emitPosicao();
        WebSocketManager::emitNos();
        WebSocketManager::emitVelBat();
    }
}
