#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
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

// ==========================================
// GERENCIADOR DE TEMPO NÃO-BLOQUEANTE
// ==========================================
void delayComServer(unsigned long ms) {
    unsigned long inicio = millis();
    while (millis() - inicio < ms) {
        server.handleClient();
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
    if (dirGlobal == 0 && y < 3) mapaParedes[x][y+1] |= (1 << 2); 
    if (dirGlobal == 1 && x < 3) mapaParedes[x+1][y] |= (1 << 3); 
    if (dirGlobal == 2 && y > 0) mapaParedes[x][y-1] |= (1 << 0); 
    if (dirGlobal == 3 && x > 0) mapaParedes[x-1][y] |= (1 << 1); 
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

            // Definição exata dos quadrantes de vitória solicitados
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
                if (!temParede(x,y,3) && x>0) menorVisinho = min(menorVisinho, mapaDist[x-1][y]); // Corrigido x>0

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

    // Validação de parada nos quadrantes centrais
    if ((robotX==1 || robotX==2) && (robotY==1 || robotY==2)) {
        estadoAtual = OBJETIVO_ALCANCADO;
        rodandoAutonomo = false;
        chegouNoCentro = true;
        return;
    }

    // ATUALIZAÇÃO E LEITURA DE PAREDES
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
    if (distF > 0 && distF < 150.0) setParede(robotX, robotY, robotDir);
    if (distD > 0 && distD < 150.0) setParede(robotX, robotY, (robotDir + 1) % 4);
    if (distE > 0 && distE < 150.0) setParede(robotX, robotY, (robotDir + 3) % 4);

    calcularFloodfill();

    // PROCESSAMENTO DO FLOODFILL
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
            
            if (valVizinho < menorD) {
                menorD = valVizinho;
                dirAlvo = d;
            }
        }
    }

    bool curvaDireita = false;
    if (dirAlvo == (robotDir + 1) % 4) {
        curvaDireita = true;
    } else if (dirAlvo == (robotDir + 3) % 4) {
        curvaDireita = false;
    }

    // Execução das manobras diretas (giro de eixo único)
    if (dirAlvo != robotDir && !pararAgora) {
        bool curvaCompleta = false;
        if (dirAlvo == (robotDir + 1) % 4 || dirAlvo == (robotDir + 3) % 4) {
            // Curva direta de 90 graus
            if (girar90(PWM_CURVAS, curvaDireita, 90)) {
                curvaCompleta = true;
            }
        } else if (dirAlvo == (robotDir + 2) % 4) {
            // Meia-volta direta de 180 graus
            if (girar90(PWM_CURVAS, true, 180)) {
                curvaCompleta = true;
            }
        }

        if (curvaCompleta && !pararAgora) {
            robotDir = dirAlvo;
            delayComServer(80); // Pausa mecânica curta para estabilizar
        }
    }

    if (pararAgora) { rodandoAutonomo = false; return; }

    // DESLOCAMENTO LINEAR
    estadoAtual = AVANCANDO_CELULA;
    bool avancoSucesso = avancaCelula(PWM_FRENTE_RE, primeiraCelula);
    primeiraCelula = false; 

    if (avancoSucesso) {
        if (robotDir == 0 && robotY < 3) robotY++;
        if (robotDir == 1 && robotX < 3) robotX++;
        if (robotDir == 2 && robotY > 0) robotY--;
        if (robotDir == 3 && robotX > 0) robotX--;
        estadoAtual = PARADO;
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
//  INTERFACE GRÁFICA HTML
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
    inicializarHardware();
    resetarLabirinto(); 
    WiFi.softAP(ssid, password);
    server.on("/", HTTP_GET, handleRoot);
    server.on("/dados", HTTP_GET, handleDados);
    server.on("/action", HTTP_GET, handleAction);
    server.begin();
    Serial.println("[BOOT] Sistema Totalmente Autonomo Pronto.");
}

void loop() {
    server.handleClient();
    atualizarLeituraToFAoVivo();
    
    if (rodandoAutonomo && estadoAtual == PARADO && !chegouNoCentro) {
        executarCicloAutonomo();
    }
    delay(2);
}