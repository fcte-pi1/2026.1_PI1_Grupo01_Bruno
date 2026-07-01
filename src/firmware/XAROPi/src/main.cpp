#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>

// ─── I2C & MPU-6050 ───────────────────────────────────────────────────────────
#define SDA_PIN      11
#define SCL_PIN      8
#define MPU_ADDR     0x68
#define PWR_MGMT_1   0x6B
#define CONFIG_REG   0x1A
#define ACCEL_XOUT_H 0x3B

// ─── Pinagem MX1508 (Motores) ────────────────────────────────────────────────
#define INT1  1
#define INT2  2
#define INT3  42
#define INT4  41

#define CH_INT1  0
#define CH_INT2  1
#define CH_INT3  2
#define CH_INT4  3
#define PWM_FREQ 1000
#define PWM_BITS 8

// ─── Pinagem Encoders ────────────────────────────────────────────────────────
#define ENC_ESQ_C1 12
#define ENC_ESQ_C2 13
#define ENC_DIR_C1 20
#define ENC_DIR_C2 21

volatile long countEsq = 0;
volatile long countDir = 0;

// ─── ToF (VL53L0X) ───────────────────────────────────────────────────────────
#define XSHUT_ESQ  5
#define XSHUT_DIR  35

Adafruit_VL53L0X tofEsq  = Adafruit_VL53L0X();
Adafruit_VL53L0X tofFrnt = Adafruit_VL53L0X();
Adafruit_VL53L0X tofDir  = Adafruit_VL53L0X();

bool tofEsqOK  = false;
bool tofFrntOK = false;
bool tofDirOK  = false;

uint16_t distEsq  = 0;
uint16_t distFrnt = 0;
uint16_t distDir  = 0;

unsigned long lastTofTime = 0;
uint8_t       tofIndex    = 0;

// Offsets estruturais dos ToFs (mm)
const int offsetEsq  = 25;
const int offsetFrnt = 25;
const int offsetDir  = 35;

// ─── Wi-Fi AP ─────────────────────────────────────────────────────────────────
const char* SSID     = "XAROPi-Bot";
const char* PASSWORD = "xaropi123";
WebServer server(80);

// ─── IMU Variáveis ────────────────────────────────────────────────────────────
bool    mpuOK        = false;
float   gz           = 0.0;
float   yaw          = 0.0;
float   gyroZ_Offset = 0.0;
unsigned long lastTime = 0;

// ─── Potência dos Motores (Ajustáveis individualmente via Web) ────────────────
int pwmEsq = 65;
int pwmDir = 65;

String ultimaAcao = "Pronto para testes manuais";

// ─── Modo automático: mover uma célula ───────────────────────────────────────
bool moverCelulaAtivo = false;

const float CELL_MM = 173.0f;       // distância de uma célula
const float MM_POR_PULSO = 1.0f;    // CALIBRAR
const uint16_t TOF_FREIO_MM = 168;  // reduz velocidade ao entrar nessa faixa
const uint16_t TOF_STOP_MM  = 95;   // margem de segurança para parar

const int PWM_CELULA_CRUZEIRO = 85;
const int PWM_CELULA_LENTO    = 45;
const float RAMPA_FINAL_MM    = 40.0f;

long alvoPulsosCelula = 0;

// ─── Interrupções dos Encoders ────────────────────────────────────────────────
void IRAM_ATTR isrEncoderEsq() {
    if (digitalRead(ENC_ESQ_C1) == digitalRead(ENC_ESQ_C2)) countEsq++; else countEsq--;
}
void IRAM_ATTR isrEncoderDir() {
    if (digitalRead(ENC_DIR_C1) == digitalRead(ENC_DIR_C2)) countDir++; else countDir--;
}

void encodersInit() {
    pinMode(ENC_ESQ_C1, INPUT_PULLUP); pinMode(ENC_ESQ_C2, INPUT_PULLUP);
    pinMode(ENC_DIR_C1, INPUT_PULLUP); pinMode(ENC_DIR_C2, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(ENC_ESQ_C1), isrEncoderEsq, CHANGE);
    attachInterrupt(digitalPinToInterrupt(ENC_DIR_C1), isrEncoderDir, CHANGE);
}

// ─── Inicialização dos ToFs ───────────────────────────────────────────────────
void tofInit() {
    pinMode(XSHUT_ESQ, OUTPUT);
    pinMode(XSHUT_DIR, OUTPUT);
    digitalWrite(XSHUT_ESQ, LOW);
    digitalWrite(XSHUT_DIR, LOW);
    delay(20);
    
    if (tofFrnt.begin(0x32, false, &Wire)) { tofFrntOK = true; }
    delay(20);
    digitalWrite(XSHUT_ESQ, HIGH);
    delay(20);
    if (tofEsq.begin(0x30, false, &Wire)) { tofEsqOK = true; }
    delay(20);
    digitalWrite(XSHUT_DIR, HIGH);
    delay(20);
    if (tofDir.begin(0x34, false, &Wire)) { tofDirOK = true; }
}

// ─── MPU-6050 Driver e Calibração Robustecida ─────────────────────────────────
void mpuWrite(uint8_t reg, uint8_t val) {
    Wire.beginTransmission(MPU_ADDR); Wire.write(reg); Wire.write(val); Wire.endTransmission();
}

bool mpuInit() {
    Wire.beginTransmission(MPU_ADDR);
    if (Wire.endTransmission() != 0) return false;
    mpuWrite(PWR_MGMT_1, 0x00); delay(50);
    mpuWrite(CONFIG_REG, 0x04); delay(50); // DLPF 20Hz contra vibração
    return true;
}

void mpuReadAll() {
    Wire.beginTransmission(MPU_ADDR); Wire.write(ACCEL_XOUT_H); Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14, (uint8_t)true);
    for(int i=0; i<6; i++) Wire.read(); // Ignora acelerômetro
    Wire.read(); Wire.read();           // Ignora temperatura
    for(int i=0; i<4; i++) Wire.read(); // Ignora Gyro X e Y
    int16_t rawGz = (Wire.read() << 8) | Wire.read();
    gz = rawGz / 131.0f;
}

void calibrateGyro() {
    for (int i = 0; i < 100; i++) { mpuReadAll(); delay(5); } // Aquecimento
    float sumZ = 0.0f; int n = 0;
    unsigned long t0 = millis();
    while (n < 500 && millis() - t0 < 6000) {
        mpuReadAll();
        if (fabsf(gz) < 3.0f) { sumZ += gz; n++; }
        delay(10);
    }
    gyroZ_Offset = (n > 0) ? (sumZ / n) : 0.0f;
}

// ─── Movimentação Bruta dos Motores ───────────────────────────────────────────
void motorsInit() {
    ledcSetup(CH_INT1, PWM_FREQ, PWM_BITS); ledcAttachPin(INT1, CH_INT1);
    ledcSetup(CH_INT2, PWM_FREQ, PWM_BITS); ledcAttachPin(INT2, CH_INT2);
    ledcSetup(CH_INT3, PWM_FREQ, PWM_BITS); ledcAttachPin(INT3, CH_INT3);
    ledcSetup(CH_INT4, PWM_FREQ, PWM_BITS); ledcAttachPin(INT4, CH_INT4);
}

void stopMotors() {
    ledcWrite(CH_INT1, 0); ledcWrite(CH_INT2, 0);
    ledcWrite(CH_INT3, 0); ledcWrite(CH_INT4, 0);
}

void setMotoresPontes(int esq, int dir) {
    if (esq >= 0) { ledcWrite(CH_INT3, esq); ledcWrite(CH_INT4, 0); }
    else          { ledcWrite(CH_INT3, 0); ledcWrite(CH_INT4, abs(esq)); }
    if (dir >= 0) { ledcWrite(CH_INT1, 0); ledcWrite(CH_INT2, dir); }
    else          { ledcWrite(CH_INT1, abs(dir)); ledcWrite(CH_INT2, 0); }
}

// ─── Rotas HTTP do Servidor Web ───────────────────────────────────────────────
void handleForward()  { setMotoresPontes(pwmEsq, pwmDir); ultimaAcao = "Frente"; server.send(200, "text/plain", "OK"); }
void handleBackward() { setMotoresPontes(-pwmEsq, -pwmDir); ultimaAcao = "Re"; server.send(200, "text/plain", "OK"); }
void handleLeft()     { setMotoresPontes(-pwmEsq, pwmDir); ultimaAcao = "Giro Esquerda"; server.send(200, "text/plain", "OK"); }
void handleRight()    { setMotoresPontes(pwmEsq, -pwmDir); ultimaAcao = "Giro Direita"; server.send(200, "text/plain", "OK"); }
void handleStop()     { stopMotors(); ultimaAcao = "Parado"; server.send(200, "text/plain", "OK"); }

void handleZerar() {
    countEsq = 0; countDir = 0; yaw = 0.0f;
    ultimaAcao = "Telemetria Zerada";
    server.send(200, "text/plain", "OK");
}

void handleSetPwm() {
    if (server.hasArg("esq")) pwmEsq = constrain(server.arg("esq").toInt(), 0, 255);
    if (server.hasArg("dir")) pwmDir = constrain(server.arg("dir").toInt(), 0, 255);
    server.send(200, "text/plain", "PWM Atualizado");
}

void handleDados() {
    String json = "{";
    json += "\"yaw\":"     + String(yaw, 1)   + ",";
    json += "\"encEsq\":"  + String(countEsq) + ",";
    json += "\"encDir\":"  + String(countDir) + ",";
    json += "\"tofEsq\":"  + String(distEsq)   + ",";
    json += "\"tofFrnt\":" + String(distFrnt)  + ",";
    json += "\"tofDir\":"  + String(distDir)   + ",";
    json += "\"pwmEsq\":"  + String(pwmEsq)    + ",";
    json += "\"pwmDir\":"  + String(pwmDir)    + ",";
    json += "\"acao\":\""  + ultimaAcao        + "\"";
    json += "}";
    server.send(200, "application/json", json);
}

void handleRoot() {
    String html = R"rawhtml(
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>XAROPi - Calibracao Física</title>
<style>
  :root { --bg:#0a0a0f; --card:#12121a; --line:#1e1e2e; --cyan:#00e5ff; --red:#ff3b3b; --text:#c8c8e0; --muted:#444466; }
  * { box-sizing: border-box; margin:0; padding:0; }
  body { background: var(--bg); color: var(--text); font-family: monospace; display: flex; flex-direction: column; align-items: center; padding: 20px 12px; gap: 14px; }
  h1 { color: var(--cyan); font-size: 1.4rem; letter-spacing: 2px; }
  .card { width: 100%; max-width: 420px; background: var(--card); border: 1px solid var(--line); padding: 14px; border-radius: 6px; }
  .card-title { font-size: .7rem; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid var(--line); padding-bottom: 4px; }
  .tele { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 10px; }
  .tele .val { font-size: 1.2rem; color: var(--cyan); font-weight: bold; }
  .tele .lbl { font-size: .65rem; color: var(--muted); }
  .slider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 0.85rem; }
  .slider-row label { min-width: 70px; }
  .slider-row input { flex: 1; accent-color: var(--cyan); }
  .slider-row .val-pwm { min-width: 30px; text-align: right; color: var(--cyan); }
  .btn-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }
  button { padding: 16px 8px; font-family: inherit; font-size: 0.9rem; font-weight: bold; background: var(--bg); color: var(--text); border: 1px solid var(--muted); border-radius: 6px; cursor: pointer; user-select: none; }
  button:active, button.pressed { background: var(--cyan); color: var(--bg); border-color: var(--cyan); }
  .btn-stop { border-color: var(--red); color: var(--red); } .btn-stop:active { background: var(--red); color: #fff; }
  .btn-util { border-color: #bb88ff; color: #bb88ff; width: 100%; max-width: 420px; padding: 14px; }
  .btn-util:active { background: #bb88ff; color: var(--bg); }
  .placeholder { background: transparent; border: none; cursor: default; }
</style>
</head>
<body>

  <h1>XAROPi - Modo Diagnóstico</h1>
  <div class="card" id="statusCard" style="text-align:center; font-size: 0.9rem;">Ação: <span id="act" style="color:var(--cyan)">—</span></div>

  <div class="card">
    <div class="card-title">Sensores Otimizados</div>
    <div class="tele">
      <div><div class="val" id="tEsq">—</div><div class="lbl">ToF ESQ</div></div>
      <div><div class="val" id="tFrn">—</div><div class="lbl">ToF FRNT</div></div>
      <div><div class="val" id="tDir">—</div><div class="lbl">ToF DIR</div></div>
      <div><div class="val" id="eEsq">—</div><div class="lbl">ENC ESQ</div></div>
      <div><div class="val" id="yaw">—</div><div class="lbl">YAW °</div></div>
      <div><div class="val" id="eDir">—</div><div class="lbl">ENC DIR</div></div>
    </div>
    <button class="btn-util" onclick="cmd('/zerar')">🔄 ZERAR CONTADORES (YAW / ENCODERS)</button>
  </div>

  <div class="card">
    <div class="card-title">Balanço de Força dos Motores</div>
    <div class="slider-row">
      <label>Motor Esq</label>
      <input type="range" min="30" max="150" value="65" id="slEsq" oninput="document.getElementById('vEsq').innerText=this.value" onchange="enviarPwm()">
      <span class="val-pwm" id="vEsq">65</span>
    </div>
    <div class="slider-row">
      <label>Motor Dir</label>
      <input type="range" min="30" max="150" value="65" id="slDir" oninput="document.getElementById('vDir').innerText=this.value" onchange="enviarPwm()">
      <span class="val-pwm" id="vDir">65</span>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Controle Direcional Bruto</div>
    <div class="btn-grid">
      <div class="placeholder"></div>
      <button id="btnFwd" onmousedown="hold('/forward','btnFwd')" onmouseup="release()" ontouchstart="hold('/forward','btnFwd')" ontouchend="release()">⬆ FRENTE</button>
      <div class="placeholder"></div>
      
      <button id="btnL" onmousedown="hold('/left','btnL')" onmouseup="release()" ontouchstart="hold('/left','btnL')" ontouchend="release()">⬅ ESQ</button>
      <button class="btn-stop" onclick="cmd('/stop')">⏹ PARAR</button>
      <button id="btnR" onmousedown="hold('/right','btnR')" onmouseup="release()" ontouchstart="hold('/right','btnR')" ontouchend="release()">DIR ➡</button>
      
      <div class="placeholder"></div>
      <button id="btnBwd" onmousedown="hold('/backward','btnBwd')" onmouseup="release()" ontouchstart="hold('/backward','btnBwd')" ontouchend="release()">⬇ RÉ</button>
      <div class="placeholder"></div>
    </div>
  </div>

<script>
var heldPath = null;
var holdInterval = null;

function cmd(path) {
  var xhr = new XMLHttpRequest(); xhr.open('GET', path, true); xhr.send();
}
function enviarPwm() {
  var e = document.getElementById('slEsq').value;
  var d = document.getElementById('slDir').value;
  cmd('/setpwm?esq=' + e + '&dir=' + d);
}
function hold(path, btnId) {
  if (heldPath) return;
  heldPath = path;
  document.getElementById(btnId).classList.add('pressed');
  cmd(path);
  holdInterval = setInterval(function(){ cmd(path); }, 150);
}
function release() {
  clearInterval(holdInterval); holdInterval = null; heldPath = null;
  cmd('/stop');
  document.querySelectorAll('.pressed').forEach(function(el){ el.classList.remove('pressed'); });
}

setInterval(() => {
  fetch('/dados').then(r => r.json()).then(d => {
    document.getElementById('yaw').innerText = d.yaw;
    document.getElementById('eEsq').innerText = d.encEsq;
    document.getElementById('eDir').innerText = d.encDir;
    document.getElementById('tEsq').innerText = d.tofEsq;
    document.getElementById('tFrn').innerText = d.tofFrnt;
    document.getElementById('tDir').innerText = d.tofDir;
    document.getElementById('act').innerText = d.acao;
  }).catch(()=>{});
}, 200);
</script>
</body></html>
)rawhtml";
    server.send(200, "text/html", html);
}

long mediaAbsEncoders() {
    return (labs(countEsq) + labs(countDir)) / 2;
}

void iniciarMoverUmaCelula() {
    countEsq = 0;
    countDir = 0;
    alvoPulsosCelula = (long)(CELL_MM / MM_POR_PULSO);
    moverCelulaAtivo = true;
    ultimaAcao = "Modo auto: mover 1 célula";
}

void atualizarMoverUmaCelula() {
    if (!moverCelulaAtivo) return;

    long pulsos = mediaAbsEncoders();
    float mmPercorridos = pulsos * MM_POR_PULSO;
    float mmRestantes = CELL_MM - mmPercorridos;

    int pwmAtualEsq = PWM_CELULA_CRUZEIRO;
    int pwmAtualDir = PWM_CELULA_CRUZEIRO;

    // desacelera ao se aproximar do alvo por encoder
    if (mmRestantes <= RAMPA_FINAL_MM) {
        pwmAtualEsq = PWM_CELULA_LENTO;
        pwmAtualDir = PWM_CELULA_LENTO;
        ultimaAcao = "Freando por encoder";
    }

    // desacelera se o ToF frontal indicar zona de decisão
    if (tofFrntOK && distFrnt > 0 && distFrnt <= TOF_FREIO_MM) {
        pwmAtualEsq = min(pwmAtualEsq, PWM_CELULA_LENTO);
        pwmAtualDir = min(pwmAtualDir, PWM_CELULA_LENTO);
        ultimaAcao = "Freando por ToF frontal";
    }

    // parada por segurança ou conclusão da célula
    if ((tofFrntOK && distFrnt > 0 && distFrnt <= TOF_STOP_MM) || (mmRestantes <= 0)) {
        stopMotors();
        moverCelulaAtivo = false;
        ultimaAcao = "Célula concluída / aguardando decisão";
        return;
    }

    setMotoresPontes(pwmAtualEsq, pwmAtualDir);
}

void handleCelula() {
    iniciarMoverUmaCelula();
    server.send(200, "text/plain", "Modo moverUmaCelula iniciado");
}

// ─── Setup ────────────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Wire.begin(SDA_PIN, SCL_PIN);
    delay(100);

    motorsInit();
    stopMotors();
    encodersInit();
    tofInit();

    WiFi.softAP(SSID, PASSWORD);
    server.on("/",         handleRoot);
    server.on("/dados",     handleDados);
    server.on("/forward",   handleForward);
    server.on("/backward",  handleBackward);
    server.on("/left",      handleLeft);
    server.on("/right",     handleRight);
    server.on("/stop",      handleStop);
    server.on("/zerar",     handleZerar);
    server.on("/setpwm",    handleSetPwm);
    server.on("/celula",    handleCelula);
    server.begin();

    mpuOK = mpuInit();
    if (mpuOK) {
        calibrateGyro();
    }
    lastTime = millis();
}

// ─── Loop Principal ───────────────────────────────────────────────────────────
void loop() {
    server.handleClient();
    unsigned long now = millis();

    // 1. ToFs (round-robin contínuo)
    if (now - lastTofTime >= 40) {
        lastTofTime = now;
        if      (tofIndex == 0 && tofEsqOK)  { uint16_t r = tofEsq.readRange();  distEsq  = (r > offsetEsq)  ? (r - offsetEsq)  : 0; }
        else if (tofIndex == 1 && tofFrntOK) { uint16_t r = tofFrnt.readRange(); distFrnt = (r > offsetFrnt) ? (r - offsetFrnt) : 0; }
        else if (tofIndex == 2 && tofDirOK)  { uint16_t r = tofDir.readRange();  distDir  = (r > offsetDir)  ? (r - offsetDir)  : 0; }
        tofIndex = (tofIndex + 1) % 3;
    }

    // 2. Giroscópio estável (~100 Hz com nova zona morta de 2.5°/s)
    if (mpuOK && (now - lastTime >= 10)) {
        float dt = (now - lastTime) / 1000.0f;
        lastTime = now;
        mpuReadAll();
        float gzComp = gz - gyroZ_Offset;
        if (fabsf(gzComp) < 2.5f) gzComp = 0.0f; 
        yaw += gzComp * dt;
    } else if (!mpuOK) {
        lastTime = now;
    }

    // 3. Controle autônomo: mover uma célula
    atualizarMoverUmaCelula();
}