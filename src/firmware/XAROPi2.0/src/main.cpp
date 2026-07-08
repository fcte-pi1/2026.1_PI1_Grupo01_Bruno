#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include "hardware/hardware.h"
#include "motor/movimento.h"

const int PWM_FRENTE_RE = 75;
const int PWM_CURVAS    = 105;
volatile bool pararAgora = false;

// ==========================================
// CONTROLE DE NAVEGAÇÃO E MATRIZ 4x4
// ==========================================
bool rodandoAutonomo = false;
bool primeiraCelula = true;
bool chegouNoCentro = false;

int robotX = 0;
int robotY = 0;
int robotDir = 0; // 0=Norte, 1=Leste, 2=Sul, 3=Oeste

int mapaDist[4][4];
byte mapaParedes[4][4]; 

enum EstadoRobo { PARADO, LENDO_SENSORES, ATUALIZANDO_MAPA, VIRANDO, AVANCANDO_CELULA, FUGA_RE_EMERGENCIA, OBJETIVO_ALCANCADO };
EstadoRobo estadoAtual = PARADO; 

float leituraFrontalAoVivo = -1, leituraDireitoAoVivo = -1, leituraEsquerdoAoVivo = -1;
unsigned long ultimaLeituraToFAoVivo = 0;

WebServer server(80);
const char* ssid = "XAROPi_AP";
const char* password = "adminxaropi";

void resetarLabirinto(); // forward decl (usada pelo handler de comando, abaixo)

// ==========================================
// SOCKET.IO — CONEXÃO COM O SERVIDOR EXTERNO (NestJS no PC)
// ==========================================
// IP do PC que roda o backend, dentro da rede XAROPi_AP (confira com ipconfig).
const char* BACKEND_HOST = "192.168.4.2";
const uint16_t BACKEND_PORT = 3000;

SocketIOclient socketIO;
bool socketConectado = false;
String idCorridaAtual = "";

void emitirEvento(const String& evento, JsonDocument& payload) {
    if (!socketConectado) return;
    DynamicJsonDocument doc(512);
    JsonArray arr = doc.to<JsonArray>();
    arr.add(evento);
    arr.add(payload.as<JsonVariant>());
    String saida;
    serializeJson(doc, saida);
    socketIO.sendEVENT(saida);
}

void wsPostNos(int idCelula, bool n, bool s, bool l, bool o) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(200);
    doc["id_corrida"] = idCorridaAtual;
    doc["id_celula"] = idCelula;
    doc["n"] = n; doc["s"] = s; doc["l"] = l; doc["o"] = o;
    emitirEvento("postNos", doc);
}

void wsPostVelBat(float velocidadeMMs, float corrente, float tensao, float mahRestante) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(200);
    doc["id_corrida"] = idCorridaAtual;
    doc["velocidade"] = velocidadeMMs;
    doc["corrente"] = corrente;
    doc["tensao"] = tensao;
    doc["mah_restante"] = mahRestante;
    emitirEvento("postVelBat", doc);
}

void wsPostFinish(float bateriaFinal) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(100);
    doc["id_corrida"] = idCorridaAtual;
    doc["bateria_final"] = bateriaFinal;
    emitirEvento("postFinish", doc);
}

// posicao é UM número (índice da célula 0-15), não um array — é o que o frontend espera.
void wsPostPosicaoAtual(int idCelula) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(100);
    doc["id_corrida"] = idCorridaAtual;
    doc["posicao"] = idCelula;
    emitirEvento("post_posicao_atual", doc);
}

// Executa o que o frontend pediu através do botão de controle do percurso.
void processarComando(const String& comando, const String& idRecebido) {
    Serial.print("[CMD] comando=" + comando + " id_corrida=" + idRecebido);
    Serial.println();

    if (comando == "iniciar") {
        idCorridaAtual = idRecebido;
        resetarLabirinto();
        pararAgora = false;
        rodandoAutonomo = true;
    } else if (comando == "pausar") {
        rodandoAutonomo = false;
    } else if (comando == "continuar") {
        pararAgora = false;
        rodandoAutonomo = true;
    } else if (comando == "cancelar") {
        rodandoAutonomo = false;
        pararAgora = true;
        motorFreio();
        pararAgora = false;
    } else if (comando == "reiniciar") {
        rodandoAutonomo = false;
        pararAgora = true;
        motorFreio();
        resetarLabirinto();
        pararAgora = false;
    }
}

void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case sIOtype_DISCONNECT:
            socketConectado = false;
            Serial.println("[IO] DESCONECTADO");
            break;

        case sIOtype_CONNECT:
            Serial.println("[IO] CONECTADO!");
            socketIO.send(sIOtype_CONNECT, "/");
            socketConectado = true;
            break;

        case sIOtype_EVENT: {
            String msg = String((char*)payload);
            Serial.print("[IO] EVENTO: ");
            Serial.println(msg);

            int inicioArray = msg.indexOf('[');
            if (inicioArray < 0) break;

            DynamicJsonDocument doc(512);
            if (deserializeJson(doc, msg.substring(inicioArray))) break;

            JsonArray arr = doc.as<JsonArray>();
            if (arr.size() < 1) break;
            String nomeEvento = arr[0].as<String>();

            if (nomeEvento == "receiveCommand" && arr.size() > 1) {
                JsonObject dados = arr[1];
                String comando = dados["comando"] | "";
                String idRecebido = dados["id_corrida"] | "";
                processarComando(comando, idRecebido);
            }
            break;
        }

        default:
            break;
    }
}

// ==========================================
// GERENCIADOR DE TEMPO NÃO-BLOQUEANTE
// ==========================================
void delayComServer(unsigned long ms) {
    unsigned long inicio = millis();
    while (millis() - inicio < ms) {
        server.handleClient();
        socketIO.loop();
        if (pararAgora) return;
        delay(2);
    }
}

bool temParede(int x, int y, int dirGlobal) {
    return (mapaParedes[x][y] & (1 << dirGlobal)) != 0;
}

void setParede(int x, int y, int dirGlobal) {
    mapaParedes[x][y] |= (1 << dirGlobal);
    if (dirGlobal == 0 && y < 3) mapaParedes[x][y+1] |= (1 << 2); 
    if (dirGlobal == 1 && x < 3) mapaParedes[x+1][y] |= (1 << 3); 
    if (dirGlobal == 2 && y > 0) mapaParedes[x][y-1] |= (1 << 0); 
    if (dirGlobal == 3 && x > 0) mapaParedes[x-1][y] |= (1 << 1); 
}

void sincronizarParedesCelula(int x, int y) {
    int idCelula = x + y * 4;
    wsPostNos(idCelula, temParede(x,y,0), temParede(x,y,2), temParede(x,y,1), temParede(x,y,3));
}

void resetarLabirinto() {
    robotX = 0; robotY = 0; robotDir = 0;
    primeiraCelula = true; chegouNoCentro = false; rodandoAutonomo = false;
    estadoAtual = PARADO;
    
    for (int x = 0; x < 4; x++) {
        for (int y = 0; y < 4; y++) {
            mapaParedes[x][y] = 0;
            if (y == 3) setParede(x, y, 0); 
            if (x == 3) setParede(x, y, 1); 
            if (y == 0) setParede(x, y, 2); 
            if (x == 0) setParede(x, y, 3); 

            if ((x==1||x==2) && (y==1||y==2)) mapaDist[x][y] = 0;
            else if ((x==1||x==2) && (y==0||y==3)) mapaDist[x][y] = 1;
            else if ((x==0||x==3) && (y==1||y==2)) mapaDist[x][y] = 1;
            else mapaDist[x][y] = 2; 
        }
    }
}

void calcularFloodfill() {
    bool mudou = true;
    while (mudou) {
        mudou = false;
        for (int x = 0; x < 4; x++) {
            for (int y = 0; y < 4; y++) {
                if ((x==1||x==2) && (y==1||y==2)) continue; 
                int menorVisinho = 255;
                if (!temParede(x,y,0) && y<3) menorVisinho = min(menorVisinho, mapaDist[x][y+1]);
                if (!temParede(x,y,1) && x<3) menorVisinho = min(menorVisinho, mapaDist[x+1][y]);
                if (!temParede(x,y,2) && y>0) menorVisinho = min(menorVisinho, mapaDist[x][y-1]);
                if (!temParede(x,y,3) && x>0) menorVisinho = min(menorVisinho, mapaDist[x-1][y]);
                if (mapaDist[x][y] != menorVisinho + 1 && menorVisinho != 255) {
                    mapaDist[x][y] = menorVisinho + 1;
                    mudou = true;
                }
            }
        }
    }
}

void atualizarLeituraToFAoVivo() {
    if (millis() - ultimaLeituraToFAoVivo < 100) return;
    ultimaLeituraToFAoVivo = millis();
    if (frontalOk)  leituraFrontalAoVivo  = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);
    if (direitoOk)  leituraDireitoAoVivo  = lerToF(sensorDireito, OFFSET_DIREITO_MM);
    if (esquerdoOk) leituraEsquerdoAoVivo = lerToF(sensorEsquerdo, OFFSET_ESQUERDO_MM);
}

// ====================
// MAQUINA DE ESTADOS 
// ====================
void executarCicloAutonomo() {
    if (pararAgora) { rodandoAutonomo = false; return; }

    if ((robotX==1 || robotX==2) && (robotY==1 || robotY==2)) {
        estadoAtual = OBJETIVO_ALCANCADO;
        rodandoAutonomo = false;
        chegouNoCentro = true;
        wsPostFinish(0); // TODO: sem sensor de bateria disponível ainda
        return;
    }

    estadoAtual = LENDO_SENSORES;
    float distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);
    float distD = lerToF(sensorDireito, OFFSET_DIREITO_MM);
    float distE = lerToF(sensorEsquerdo, OFFSET_ESQUERDO_MM);

    if (distF > 0 && distF < 32.0) {
        estadoAtual = FUGA_RE_EMERGENCIA;
        motorRe(PWM_FRENTE_RE); 
        delayComServer(300); 
        motorFreio();
        if (pararAgora) { rodandoAutonomo = false; return; }
        distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM); 
    }

    estadoAtual = ATUALIZANDO_MAPA;
    bool paredeNova = false;
    if (distF > 0 && distF < 150.0) { setParede(robotX, robotY, robotDir); paredeNova = true; }
    if (distD > 0 && distD < 150.0) { setParede(robotX, robotY, (robotDir + 1) % 4); paredeNova = true; }
    if (distE > 0 && distE < 150.0) { setParede(robotX, robotY, (robotDir + 3) % 4); paredeNova = true; }
    if (paredeNova) sincronizarParedesCelula(robotX, robotY);

    calcularFloodfill();

    estadoAtual = VIRANDO;
    int dirAlvo = robotDir;
    int menorD = 255;
    int dirCheck[4] = { robotDir, (robotDir + 1) % 4, (robotDir + 3) % 4, (robotDir + 2) % 4 };
    
    for (int i = 0; i < 4; i++) {
        int d = dirCheck[i];
        if (!temParede(robotX, robotY, d)) {
            int valVizinho = 255;
            if (d == 0 && robotY < 3) valVizinho = mapaDist[robotX][robotY+1];
            if (d == 1 && robotX < 3) valVizinho = mapaDist[robotX+1][robotY];
            if (d == 2 && robotY > 0) valVizinho = mapaDist[robotX][robotY-1];
            if (d == 3 && robotX > 0) valVizinho = mapaDist[robotX-1][robotY];
            if (valVizinho < menorD) { menorD = valVizinho; dirAlvo = d; }
        }
    }

    bool curvaDireita = (dirAlvo == (robotDir + 1) % 4);

    if (dirAlvo != robotDir && !pararAgora) {
        bool curvaCompleta = false;
        if (dirAlvo == (robotDir + 1) % 4 || dirAlvo == (robotDir + 3) % 4) {
            if (girar90(PWM_CURVAS, curvaDireita, 90)) curvaCompleta = true;
        } else if (dirAlvo == (robotDir + 2) % 4) {
            if (girar90(PWM_CURVAS, true, 180)) curvaCompleta = true;
        }
        if (curvaCompleta && !pararAgora) {
            robotDir = dirAlvo;
            delayComServer(80);
        }
    }

    if (pararAgora) { rodandoAutonomo = false; return; }

    estadoAtual = AVANCANDO_CELULA;
    unsigned long tInicio = millis();
    bool avancoSucesso = avancaCelula(PWM_FRENTE_RE, primeiraCelula);
    unsigned long duracaoMs = millis() - tInicio;
    primeiraCelula = false; 

    if (avancoSucesso) {
        if (robotDir == 0 && robotY < 3) robotY++;
        if (robotDir == 1 && robotX < 3) robotX++;
        if (robotDir == 2 && robotY > 0) robotY--;
        if (robotDir == 3 && robotX > 0) robotX--;
        estadoAtual = PARADO;

        wsPostPosicaoAtual(robotX + robotY * 4);

        float pulsosMedios = (abs(contagemEncoderEsq) + abs(contagemEncoderDir)) / 2.0f;
        float distanciaMM = pulsosMedios / pulsosPorMM;
        float velocidadeMMs = duracaoMs > 0 ? (distanciaMM / (duracaoMs / 1000.0f)) : 0.0f;
        wsPostVelBat(velocidadeMMs, 0, 0, 0); // TODO: corrente/tensão/mAh sem sensor ainda
    } else {
        estadoAtual = FUGA_RE_EMERGENCIA;
        motorRe(PWM_FRENTE_RE); 
        delayComServer(220); 
        motorFreio();
        estadoAtual = PARADO;
        Serial.println("[SYSTEM] Movimento interrompido, tentando recuperar no próximo ciclo.");
    }
}

// =========================
//  INTERFACE GRÁFICA HTML (teste local do time de firmware — não mexida)
// =========================
const char* htmlPage = R"rawliteral(
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XAROPi - Floodfill 4x4</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; background: #2c3e50; color: white; margin: 0; padding: 15px; }
        h1 { font-size: 20px; margin-bottom: 10px; }
        .box { background: #34495e; border-radius: 10px; padding: 15px; max-width: 400px; margin: 10px auto; }
        .row { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
        .map-box { background: #1abc9c; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; }
        .state-box { background: #e67e22; padding: 10px; border-radius: 8px; font-weight: bold; }
        .btn { padding: 14px 20px; font-size: 14px; font-weight: bold; border-radius: 8px; border: none; color: white; cursor: pointer; width: 100%; margin-top: 10px;}
        .btn:active { transform: scale(0.97); }
        .btn-go { background: #2ecc71; }
        .btn-stop { background: #e74c3c; font-size: 16px; }
        .btn-reset { background: #9b59b6; }
        .tof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;}
        .tof-grid div { background: #2c3e50; padding: 8px; border-radius: 6px; }
        span { color: #f1c40f; display: block; font-size: 1.1rem; margin-top: 5px;}
    </style>
</head>
<body>
    <h1>XAROPi - Floodfill 4x4</h1>
    <div class="box row">
        <div class="map-box">Posição: (<span style="color:white; display:inline;" id="posX">0</span>, <span style="color:white; display:inline;" id="posY">0</span>)</div>
        <div class="map-box">Olhando: <span style="color:white; display:inline;" id="dir">Norte</span></div>
        <div class="map-box">Dist: <span style="color:white; display:inline;" id="distAlvo">--</span></div>
    </div>
    <div class="box">
        <div class="state-box" id="estadoRobo">Aguardando...</div>
        <div class="tof-grid">
            <div>ESQ<span><span id="tE">--</span></span></div>
            <div>FRENTE<span><span id="tF">--</span></span></div>
            <div>DIR<span><span id="tD">--</span></span></div>
        </div>
    </div>
    <div class="box">
        <button class="btn btn-go" onclick="enviar('AUTO')">INICIAR LOOP AUTÔNOMO</button>
        <button class="btn btn-stop" onclick="enviar('S')">⛔ STOP IMEDIATO</button>
        <button class="btn btn-reset" onclick="enviar('RESET')">🔄 RESETAR MAPA E ROBO</button>
    </div>
    <script>
        const direcoes = ["Norte (0)", "Leste (1)", "Sul (2)", "Oeste (3)"];
        const estados = ["PARADO", "LENDO SENSORES", "ATUALIZANDO MAPA", "VIRANDO (BALIZA)", "AVANÇANDO CÉLULA", "FUGA / ESTOL ATIVO", "VENCEU! (CENTRO)"];
        function enviar(acao) { fetch(`/action?go=${acao}`); }
        function atualizarPainel() {
            fetch('/dados').then(r => r.json()).then(data => {
                document.getElementById('tF').innerText = data.tofF >= 0 ? data.tofF.toFixed(0) + "mm" : "erro";
                document.getElementById('tD').innerText = data.tofD >= 0 ? data.tofD.toFixed(0) + "mm" : "erro";
                document.getElementById('tE').innerText = data.tofE >= 0 ? data.tofE.toFixed(0) + "mm" : "erro";
                document.getElementById('posX').innerText = data.x;
                document.getElementById('posY').innerText = data.y;
                document.getElementById('distAlvo').innerText = data.distVal;
                document.getElementById('dir').innerText = direcoes[data.d];
                document.getElementById('estadoRobo').innerText = "Status: " + estados[data.estado];
            });
        }
        setInterval(atualizarPainel, 250);
        atualizarPainel();
    </script>
</body>
</html>
)rawliteral";

void handleRoot() { server.send(200, "text/html", htmlPage); }
void handleDados() {
    String json = "{\"tofF\":" + String(leituraFrontalAoVivo, 1) +
                  ", \"tofD\":" + String(leituraDireitoAoVivo, 1) +
                  ", \"tofE\":" + String(leituraEsquerdoAoVivo, 1) +
                  ", \"x\":" + String(robotX) +
                  ", \"y\":" + String(robotY) +
                  ", \"distVal\":" + String(mapaDist[robotX][robotY]) +
                  ", \"d\":" + String(robotDir) +
                  ", \"estado\":" + String((int)estadoAtual) + "}";
    server.send(200, "application/json", json);
}



void comandoAuto() {
    rodandoAutonomo = true; pararAgora = false;
}

void comandoStop() {
    rodandoAutonomo = false; pararAgora = true; estadoAtual = PARADO; motorFreio();
}

void comandoReset() {
    rodandoAutonomo = false; pararAgora = true; motorFreio();
    resetarLabirinto();
}

void handleAction() {
    String comando = server.arg("go");
    if (comando == "S"){
        rodandoAutonomo = false; pararAgora = true; estadoAtual = PARADO; motorFreio();      
        server.send(200, "text/plain", "OK"); delay(50); pararAgora = false; return;
    } else if (comando == "AUTO") {
        rodandoAutonomo = true; pararAgora = false;
        server.send(200, "text/plain", "OK"); return;
    } else if (comando == "RESET") {
        rodandoAutonomo = false; pararAgora = true; motorFreio();
        resetarLabirinto();
        server.send(200, "text/plain", "OK"); delay(50); pararAgora = false; return;
    }
    server.send(200, "text/plain", "OK");
}

void setup() {
    Serial.begin(115200);
    // inicializarHardware();
    resetarLabirinto(); 
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ssid, password);
    Serial.print("[WIFI] IP da ESP: "); Serial.println(WiFi.softAPIP());

    socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&role=firmware&client=xaropi_esp32");
    socketIO.onEvent(socketIOEvent);
    socketIO.setReconnectInterval(5000);

    server.on("/", HTTP_GET, handleRoot);
    server.on("/dados", HTTP_GET, handleDados);
    server.on("/action", HTTP_GET, handleAction);
    server.begin();
    Serial.println("[BOOT] Pronto.");
}

void loop() {
    server.handleClient();
    socketIO.loop();
    atualizarLeituraToFAoVivo();
    
    if (rodandoAutonomo && estadoAtual == PARADO && !chegouNoCentro) {
        executarCicloAutonomo();
    }
    delay(2);
}