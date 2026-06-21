#include "WebSocketManager.h"
#include "../config.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

static WebSocketsClient _ws;
static WebServer        _http(80);
static String           _logBuf   = "";
static bool             _wsReady  = false; 

void WebSocketManager::log(const String& msg) {
    String entry = "[" + String(millis() / 1000) + "s] " + msg + "<br>";
    _logBuf = entry + _logBuf;
    if (_logBuf.length() > 3000) _logBuf = _logBuf.substring(0, 3000);
}

// Página de monitoramento 192.168.4.1
static void handleRoot() {
    String html =
        "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
        "<meta http-equiv='refresh' content='2'>"
        "<title>XAROPi Monitor</title></head>"
        "<body style='background:#111;color:#0f0;font-family:monospace;padding:20px'>"
        "<h2>XAROPi — Monitor Wi-Fi</h2>"
        "<p>Corrida: <b>" + robot.idCorrida + "</b> | "
        "Status: <b>" + String(robot.corridaAtiva ? "RODANDO" : "PARADO") + "</b> | "
        "Pos: <b>(" + String(robot.posX) + "," + String(robot.posY) + ")</b></p>"
        "<div style='border:1px solid #333;padding:10px;background:#000'>" + _logBuf + "</div>"
        "</body></html>";
    _http.send(200, "text/html", html);
}


static void emit(const String& event, const String& payload) {
    if (!_wsReady) return;
    _ws.sendTXT("42[\"" + event + "\"," + payload + "]");
}

static void processarComando(const String& text) {
    if (!text.startsWith("42[")) return;

    JsonDocument doc;
    if (deserializeJson(doc, text.substring(2)) != DeserializationError::Ok) {
        WebSocketManager::log("❌ JSON inválido");
        return;
    }

    if (strcmp(doc[0], "receiveCommand") != 0) return;

    String cmd    = doc[1]["comando"].as<String>();
    String corrida = doc[1]["id_corrida"].as<String>();
    robot.idCorrida = corrida;

    WebSocketManager::log("Comando: " + cmd);

    if (cmd == "iniciar" || cmd == "continuar") {
        robot.corridaAtiva = true;
    } else if (cmd == "pausar") {
        robot.corridaAtiva = false;
    } else if (cmd == "cancelar" || cmd == "reiniciar") {
        robot.corridaAtiva    = false;
        robot.posX            = 0;
        robot.posY            = 0;
        robot.heading         = DIR_NORTH;
        robot.chegouAoCentro  = false;
        robot.mahRestante     = 1000;
        robot.distancia       = 0.0f;
        memset(robot.maze,      0,   sizeof(robot.maze));
        memset(robot.distances, 255, sizeof(robot.distances));
    }
}

static void onWsEvent(WStype_t type, uint8_t* payload, size_t length) {
    String text = (char*)payload;

    switch (type) {
        case WStype_CONNECTED:
            _wsReady = false;
            WebSocketManager::log("🔌 TCP ok. Aguardando handshake...");
            break;

        case WStype_DISCONNECTED:
            _wsReady = false;
            robot.corridaAtiva = false;
            WebSocketManager::log("🔴 Desconectado do backend.");
            break;

        case WStype_TEXT:
            if      (text.startsWith("0"))  { _ws.sendTXT("40"); }             // handshake
            else if (text.startsWith("40")) { _wsReady = true;
                                              WebSocketManager::log("🟢 Pronto!"); }
            else if (text == "2")           { _ws.sendTXT("3"); }              // heartbeat
            else                            { processarComando(text); }
            break;

        default: break;
    }
}

void WebSocketManager::init() {
    WiFi.softAP(WIFI_SSID, WIFI_PASSWORD);
    log("AP: " + String(WIFI_SSID) + " | IP: " + WiFi.softAPIP().toString());

    _http.on("/", handleRoot);
    _http.begin();

    _ws.begin(BACKEND_HOST, BACKEND_PORT, WS_PATH);
    _ws.onEvent(onWsEvent);
    _ws.setReconnectInterval(5000);

    randomSeed(analogRead(0));
}

void WebSocketManager::loop() {
    _ws.loop();
    _http.handleClient();
}

void WebSocketManager::emitPosicao() {
    int posIndex = robot.posY * MAZE_SIZE + robot.posX;
    JsonDocument doc;
    doc["id_corrida"] = robot.idCorrida;
    doc["posicao"]    = posIndex;
    String s; serializeJson(doc, s);
    emit("post_posicao_atual", s);
}

void WebSocketManager::emitNos() {
    int posIndex = robot.posY * MAZE_SIZE + robot.posX;
    uint8_t w = robot.maze[robot.posX][robot.posY];
    JsonDocument doc;
    doc["id_corrida"] = robot.idCorrida;
    doc["id_celula"]  = posIndex;
    doc["n"] = (bool)(w & WALL_NORTH);
    doc["s"] = (bool)(w & WALL_SOUTH);
    doc["l"] = (bool)(w & WALL_EAST);
    doc["o"] = (bool)(w & WALL_WEST);
    String s; serializeJson(doc, s);
    emit("postNos", s);
}

void WebSocketManager::emitVelBat() {
    static float tempoTotal = 0.0f;
    static unsigned long lastMs = 0;
    tempoTotal += (millis() - lastMs) / 1000.0f;
    lastMs = millis();

    JsonDocument doc;
    doc["id_corrida"]   = robot.idCorrida;
    doc["velocidade"]   = String(robot.velocidade, 2);
    doc["tensao"]       = String(robot.tensao, 2);
    doc["corrente"]     = (int)robot.corrente;
    doc["mah_restante"] = robot.mahRestante;
    doc["tempoMedio"]   = String(tempoTotal, 1);
    doc["velMedia"]     = "0.38";
    doc["distancia"]    = String(robot.distancia, 2);
    String s; serializeJson(doc, s);
    emit("postVelBat", s);
}

void WebSocketManager::emitFinish() {
    JsonDocument doc;
    doc["id_corrida"]    = robot.idCorrida;
    doc["bateria_final"] = robot.mahRestante;
    String s; serializeJson(doc, s);
    emit("postFinish", s);
}
