#include <Arduino.h>
#include <WiFi.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include "hardware/hardware.h"
#include "motor/movimento.h"


const int PWM_FRENTE_RE = 75;
const int PWM_CURVAS    = 105;

const int MAX_FALHAS_CONSECUTIVAS = 5;
int falhasConsecutivas = 0;

volatile bool pararAgora = false;
bool rodandoAutonomo = false;
bool primeiraCelula = true;
bool chegouNoCentro = false;


int robotX = 0;
int robotY = 0;
int robotDir = 0; // 0=Norte, 1=Leste, 2=Sul, 3=Oeste

int mapaDist[4][4];      
byte mapaParedes[4][4];  

// estados possíveis da máquina de estados do robô.
enum EstadoRobo {
    PARADO,
    LENDO_SENSORES,
    ATUALIZANDO_MAPA,
    VIRANDO,
    AVANCANDO_CELULA,
    FUGA_RE_EMERGENCIA,
    OBJETIVO_ALCANCADO,
    ERRO_TRAVADO
};
EstadoRobo estadoAtual = PARADO;

String idCorridaAtual = "";


void wsPostNos(int idCelula, bool n, bool s, bool l, bool o);
void wsPostVelBat(float velocidadeMMs, float corrente, float tensao, float mahRestante);
void wsPostFinish(float bateriaFinal);
void wsPostPosicaoAtual(int idCelula);
void delayComServer(unsigned long ms); 


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


void sincronizarParedesCelula(int x, int y) {
    int idCelula = x + y * 4;
    wsPostNos(idCelula, temParede(x,y,0), temParede(x,y,2), temParede(x,y,1), temParede(x,y,3));
}


void resetarLabirinto() {
    robotX = 0; robotY = 0; robotDir = 0;
    primeiraCelula = true; chegouNoCentro = false; rodandoAutonomo = false;
    estadoAtual = PARADO;
    falhasConsecutivas = 0;

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

void travarPorFalhas() {
    rodandoAutonomo = false;
    pararAgora = false;
    estadoAtual = ERRO_TRAVADO;
    motorFreio();
    Serial.println("[SYSTEM] Excesso de falhas consecutivas. Robo travado em ERRO_TRAVADO.");
    wsPostFinish(-1); // bateria_final = -1 sinaliza para o backend que foi erro, não vitória
}


void executarCicloAutonomo() {
    if (pararAgora) { rodandoAutonomo = false; return; }

    // chegou ao centro do labirinto: sucesso, encerra a corrida.
    if ((robotX==1 || robotX==2) && (robotY==1 || robotY==2)) {
        estadoAtual = OBJETIVO_ALCANCADO;
        rodandoAutonomo = false;
        chegouNoCentro = true;
        wsPostFinish(0); 
        return;
    }

    estadoAtual = LENDO_SENSORES;
    float distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);
    float distD = lerToF(sensorDireito, OFFSET_DIREITO_MM);
    float distE = lerToF(sensorEsquerdo, OFFSET_ESQUERDO_MM);

    // obstáculo muito perto na frente: recua rapidinho antes de continuar.
    if (distF > 0 && distF < 32.0) {
        estadoAtual = FUGA_RE_EMERGENCIA;
        motorRe(PWM_FRENTE_RE);
        delayComServer(300);
        motorFreio();
        if (pararAgora) { rodandoAutonomo = false; return; }
        distF = lerToF(sensorFrontal, OFFSET_FRONTAL_MM);

        falhasConsecutivas++;
        if (falhasConsecutivas >= MAX_FALHAS_CONSECUTIVAS) { travarPorFalhas(); return; }
    }

    estadoAtual = ATUALIZANDO_MAPA;
    bool paredeNova = false;
    if (distF > 0 && distF < 150.0) { setParede(robotX, robotY, robotDir); paredeNova = true; }
    if (distD > 0 && distD < 150.0) { setParede(robotX, robotY, (robotDir + 1) % 4); paredeNova = true; }
    if (distE > 0 && distE < 150.0) { setParede(robotX, robotY, (robotDir + 3) % 4); paredeNova = true; }
    if (paredeNova) sincronizarParedesCelula(robotX, robotY);

    calcularFloodfill();

    // Escolhe a direção vizinha (dentre as sem parede) com menor distância floodfill.
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

    bool curvaDireita = false;
    if (dirAlvo == (robotDir + 1) % 4) {
        curvaDireita = true;
    } else if (dirAlvo == (robotDir + 3) % 4) {
        curvaDireita = false;
    }

    if (dirAlvo != robotDir && !pararAgora) {
        bool curvaCompleta = false;
        if (dirAlvo == (robotDir + 1) % 4 || dirAlvo == (robotDir + 3) % 4) {
            if (girar90(PWM_CURVAS, curvaDireita, 90)) {
                curvaCompleta = true;
            }
        } else if (dirAlvo == (robotDir + 2) % 4) {
            if (girar90(PWM_CURVAS, true, 180)) {
                curvaCompleta = true;
            }
        }

        if (curvaCompleta && !pararAgora) {
            robotDir = dirAlvo;
            delayComServer(80); // Pausa para estabilizar
        }
    }

    if (pararAgora) { rodandoAutonomo = false; return; }

    // Avança uma célula na direção decidida.
    estadoAtual = AVANCANDO_CELULA;
    unsigned long tInicio = millis();
    bool avancoSucesso = avancaCelula(PWM_FRENTE_RE, primeiraCelula);
    unsigned long duracaoMs = millis() - tInicio;
    primeiraCelula = false;

    if (avancoSucesso) {
        falhasConsecutivas = 0; // avançou de verdade: zera o contador de falhas

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
        // Não conseguiu avançar: recua, freia e conta como falha.
        estadoAtual = FUGA_RE_EMERGENCIA;
        motorRe(PWM_FRENTE_RE);
        delayComServer(220);
        motorFreio();
        estadoAtual = PARADO;
        Serial.println("[SYSTEM] Movimento interrompido, tentando recuperar no proximo ciclo.");

        falhasConsecutivas++;
        if (falhasConsecutivas >= MAX_FALHAS_CONSECUTIVAS) { travarPorFalhas(); return; }
    }
}

// Aplica o comando vindo do frontend (via backend) sobre o estado do robô.
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



const char* ssid = "Lipej";
const char* password = "Minha_Senha00$";

const char* BACKEND_HOST = "10.122.47.8"; 
const uint16_t BACKEND_PORT = 3000;

SocketIOclient socketIO;
bool socketConectado = false;

// Espera "ms" milissegundos SEM travar o Socket.IO
// (usar sempre no lugar de delay() puro dentro do loop autônomo).
void delayComServer(unsigned long ms) {
    unsigned long inicio = millis();
    while (millis() - inicio < ms) {
        socketIO.loop();
        if (pararAgora) return;
        delay(2);
    }
}

// Monta o pacote Socket.IO padrão ["evento", {...payload}] e envia ao backend.
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

// Informa ao backend quais paredes uma célula do labirinto possui.
void wsPostNos(int idCelula, bool n, bool s, bool l, bool o) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(200);
    doc["id_corrida"] = idCorridaAtual;
    doc["id_celula"] = idCelula;
    doc["n"] = n; doc["s"] = s; doc["l"] = l; doc["o"] = o;
    emitirEvento("postNos", doc);
}

// Envia telemetria de velocidade/bateria ao backend.
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

// Avisa o backend que a corrida terminou (sucesso ou erro).
void wsPostFinish(float bateriaFinal) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(100);
    doc["id_corrida"] = idCorridaAtual;
    doc["bateria_final"] = bateriaFinal;
    emitirEvento("postFinish", doc);
}

// Envia ao backend a célula (0-15) em que o robô está agora.
void wsPostPosicaoAtual(int idCelula) {
    if (idCorridaAtual == "") return;
    DynamicJsonDocument doc(100);
    doc["id_corrida"] = idCorridaAtual;
    doc["posicao"] = idCelula;
    emitirEvento("post_posicao_atual", doc);
}

// Callback central do Socket.IO: trata conexão, desconexão e eventos recebidos.
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


void setup() {
    Serial.begin(115200);
    inicializarHardware();   
    resetarLabirinto();

  
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("[WIFI] Conectando em ");
    Serial.print(ssid);

    unsigned long inicioTentativa = millis();
    while (WiFi.status() != WL_CONNECTED) {
        delay(300);
        Serial.print(".");
        // Depois de ~20s sem conseguir conectar, tenta de novo do zero.
        // Evita o ESP32 ficar preso pra sempre se o roteador demorar a subir.
        if (millis() - inicioTentativa > 20000) {
            Serial.println();
            Serial.println("[WIFI] Demorando demais, tentando reconectar...");
            WiFi.disconnect();
            delay(500);
            WiFi.begin(ssid, password);
            inicioTentativa = millis();
        }
    }
    Serial.println();
    Serial.print("[WIFI] Conectado! IP do robo na rede lipej: ");
    Serial.println(WiFi.localIP());
    Serial.println("[WIFI] Confirme que o BACKEND_HOST aponta pro IP do PC nesta mesma rede.");

    socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4&role=firmware&client=xaropi_esp32");
    socketIO.onEvent(socketIOEvent);
    socketIO.setReconnectInterval(5000);

    Serial.println("[BOOT] Pronto.");
}

// Laço principal: atende o socket e roda 1 ciclo da máquina de estados
// quando o robô está em modo autônomo e parado.
void loop() {
    socketIO.loop();

    if (rodandoAutonomo && estadoAtual == PARADO && !chegouNoCentro) {
        executarCicloAutonomo();
    }
    delay(2);
}