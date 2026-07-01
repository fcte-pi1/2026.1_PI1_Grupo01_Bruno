#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// =========================
// PINAGEM NOVA
// =========================
static const int ENC_DIR_C1   = 47;
static const int ENC_DIR_C2   = 48;
static const int MOT_DIR_IN1  = 42;
static const int MOT_DIR_IN2  = 41;

static const int ENC_ESQ_C1   = 12;
static const int ENC_ESQ_C2   = 14;
static const int MOT_ESQ_IN1  = 15;
static const int MOT_ESQ_IN2  = 16;

static const int XSHUT_TOF_ESQ = 5;
static const int XSHUT_TOF_DIR = 40;

// ToF frontal sem XSHUT
static const int SDA_PIN = 8;   // ajuste se necessário na sua placa
static const int SCL_PIN = 9;   // ajuste se necessário na sua placa

// MPU6050
#define MPU_ADDR     0x68
#define PWR_MGMT_1   0x6B
#define CONFIG_REG   0x1A
#define ACCEL_XOUT_H 0x3B

// Endereços I2C finais dos ToFs
static const uint8_t TOF_ADDR_FRONT = 0x29; // padrão
static const uint8_t TOF_ADDR_LEFT  = 0x30;
static const uint8_t TOF_ADDR_RIGHT = 0x31;

// Offsets informados
const int offsetEsq  = 25;
const int offsetFrnt = 25;
const int offsetDir  = 35;

// Wi-Fi AP
const char* AP_SSID = "ESP32S3_Robo";
const char* AP_PASS = "12345678";

WebServer server(80);

// Sensores
Adafruit_VL53L0X tofFront;
Adafruit_VL53L0X tofLeft;
Adafruit_VL53L0X tofRight;
Adafruit_MPU6050 mpu;

// Estado do sistema
enum InitState { NOT_INIT = 0, INIT_OK = 1, INIT_FAIL = 2 };

volatile long encLeftCount = 0;
volatile long encRightCount = 0;

InitState tofFrontState = NOT_INIT;
InitState tofLeftState  = NOT_INIT;
InitState tofRightState = NOT_INIT;
InitState mpuState      = NOT_INIT;

String tofFrontError = "";
String tofLeftError  = "";
String tofRightError = "";
String mpuError      = "";

int pwmLeft = 120;
int pwmRight = 120;
bool motorsEnabled = false;

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_PERIOD_MS = 150;

float ax_g = 0, ay_g = 0, az_g = 0;
float gx_dps = 0, gy_dps = 0, gz_dps = 0;
float temp_c = 0;

int distLeft = -1;
int distFront = -1;
int distRight = -1;

// LEDC config
static const int PWM_FREQ = 20000;
static const int PWM_RES_BITS = 8;
static const int PWM_MAX = 255;

static const int CH_MOT_DIR_IN1 = 0;
static const int CH_MOT_DIR_IN2 = 1;
static const int CH_MOT_ESQ_IN1 = 2;
static const int CH_MOT_ESQ_IN2 = 3;

// =========================
// HTML
// =========================
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ESP32S3 Controle</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background:#0f172a; color:#e2e8f0; }
    .card { background:#1e293b; padding:16px; border-radius:12px; margin-bottom:16px; }
    button { padding:10px 14px; border:0; border-radius:8px; cursor:pointer; margin:4px; }
    .ok { background:#16a34a; color:white; }
    .warn { background:#dc2626; color:white; }
    .info { background:#2563eb; color:white; }
    .muted { background:#475569; color:white; }
    input[type=range] { width:100%; }
    .row { display:flex; gap:16px; flex-wrap:wrap; }
    .col { flex:1; min-width:280px; }
    pre { white-space:pre-wrap; word-break:break-word; }
    .status-ok { color:#4ade80; }
    .status-fail { color:#f87171; }
    .status-wait { color:#facc15; }
  </style>
</head>
<body>
  <h1>Painel ESP32-S3</h1>

  <div class="card">
    <h2>Sensores</h2>
    <button class="info" onclick="initAll()">Inicializar sensores</button>
    <button class="warn" onclick="retryAll()">Tentar acionamento novamente</button>
    <button class="muted" onclick="refreshStatus()">Atualizar status</button>
    <div id="sensorStatus"></div>
  </div>

  <div class="card">
    <h2>Motores</h2>
    <div class="row">
      <div class="col">
        <label>PWM motor esquerdo: <span id="pwmLeftVal">120</span></label>
        <input type="range" min="0" max="255" value="120" id="pwmLeft" oninput="pwmLeftVal.textContent=this.value">
      </div>
      <div class="col">
        <label>PWM motor direito: <span id="pwmRightVal">120</span></label>
        <input type="range" min="0" max="255" value="120" id="pwmRight" oninput="pwmRightVal.textContent=this.value">
      </div>
    </div>
    <button class="info" onclick="applyPWM()">Aplicar PWM</button>
    <button class="ok" onclick="moveCmd('forward')">Frente</button>
    <button class="info" onclick="moveCmd('left')">Esquerda</button>
    <button class="info" onclick="moveCmd('right')">Direita</button>
    <button class="muted" onclick="moveCmd('backward')">Ré</button>
    <button class="warn" onclick="moveCmd('stop')">Parar</button>
  </div>

  <div class="card">
    <h2>Telemetria</h2>
    <pre id="telemetry">Carregando...</pre>
  </div>

<script>
async function getJSON(url, options={}) {
  const res = await fetch(url, options);
  return await res.json();
}

function statusLine(name, st, err, val) {
  let cls = 'status-wait', txt = 'não inicializado';
  if (st === 1) { cls = 'status-ok'; txt = 'ok'; }
  if (st === 2) { cls = 'status-fail'; txt = 'falhou'; }
  return `<p><b>${name}</b>: <span class="${cls}">${txt}</span>${val ? ' | valor: ' + val : ''}${err ? ' | erro: ' + err : ''}</p>`;
}

async function refreshStatus() {
  try {
    const d = await getJSON('/status');
    document.getElementById('sensorStatus').innerHTML =
      statusLine('ToF esquerdo', d.tofLeftState, d.tofLeftError, d.distLeft) +
      statusLine('ToF frontal', d.tofFrontState, d.tofFrontError, d.distFront) +
      statusLine('ToF direito', d.tofRightState, d.tofRightError, d.distRight) +
      statusLine('MPU6050', d.mpuState, d.mpuError, `gx=${d.gx}, gy=${d.gy}, gz=${d.gz}`);

    document.getElementById('telemetry').textContent = JSON.stringify(d, null, 2);
  } catch (e) {
    document.getElementById('sensorStatus').innerHTML =
      '<p class="status-fail">Não foi possível consultar o status.</p>';
  }
}

async function initAll() {
  try {
    await getJSON('/init');
    refreshStatus();
  } catch (e) {
    alert('Não foi possível ligar os sensores.');
  }
}

async function retryAll() {
  try {
    await getJSON('/retry');
    refreshStatus();
  } catch (e) {
    alert('Não foi possível tentar novamente.');
  }
}

async function applyPWM() {
  const l = document.getElementById('pwmLeft').value;
  const r = document.getElementById('pwmRight').value;
  try {
    await getJSON(`/pwm?left=${l}&right=${r}`);
    refreshStatus();
  } catch (e) {
    alert('Não foi possível aplicar PWM.');
  }
}

async function moveCmd(cmd) {
  try {
    await getJSON(`/move?cmd=${cmd}`);
    refreshStatus();
  } catch (e) {
    alert('Não foi possível acionar o comando.');
  }
}

setInterval(refreshStatus, 1000);
refreshStatus();
</script>
</body>
</html>
)rawliteral";

// =========================
// ENCODERS
// =========================
void IRAM_ATTR isrEncLeft() {
  int b = digitalRead(ENC_ESQ_C2);
  encLeftCount += (b ? 1 : -1);
}

void IRAM_ATTR isrEncRight() {
  int b = digitalRead(ENC_DIR_C2);
  encRightCount += (b ? 1 : -1);
}

// =========================
// MOTORES
// =========================
void stopMotors() {
  ledcWrite(CH_MOT_DIR_IN1, 0);
  ledcWrite(CH_MOT_DIR_IN2, 0);
  ledcWrite(CH_MOT_ESQ_IN1, 0);
  ledcWrite(CH_MOT_ESQ_IN2, 0);
  motorsEnabled = false;
}

void motorsInit() {
  ledcSetup(CH_MOT_DIR_IN1, PWM_FREQ, PWM_RES_BITS);
  ledcSetup(CH_MOT_DIR_IN2, PWM_FREQ, PWM_RES_BITS);
  ledcSetup(CH_MOT_ESQ_IN1, PWM_FREQ, PWM_RES_BITS);
  ledcSetup(CH_MOT_ESQ_IN2, PWM_FREQ, PWM_RES_BITS);

  ledcAttachPin(MOT_DIR_IN1, CH_MOT_DIR_IN1);
  ledcAttachPin(MOT_DIR_IN2, CH_MOT_DIR_IN2);
  ledcAttachPin(MOT_ESQ_IN1, CH_MOT_ESQ_IN1);
  ledcAttachPin(MOT_ESQ_IN2, CH_MOT_ESQ_IN2);

  stopMotors();
}

void setMotorPWM(int left, int right) {
  pwmLeft = constrain(left, 0, PWM_MAX);
  pwmRight = constrain(right, 0, PWM_MAX);
}

void moveForward() {
  ledcWrite(CH_MOT_ESQ_IN1, pwmLeft);
  ledcWrite(CH_MOT_ESQ_IN2, 0);
  ledcWrite(CH_MOT_DIR_IN1, pwmRight);
  ledcWrite(CH_MOT_DIR_IN2, 0);
  motorsEnabled = true;
}

void moveBackward() {
  ledcWrite(CH_MOT_ESQ_IN1, 0);
  ledcWrite(CH_MOT_ESQ_IN2, pwmLeft);
  ledcWrite(CH_MOT_DIR_IN1, 0);
  ledcWrite(CH_MOT_DIR_IN2, pwmRight);
  motorsEnabled = true;
}

void turnLeft() {
  ledcWrite(CH_MOT_ESQ_IN1, 0);
  ledcWrite(CH_MOT_ESQ_IN2, pwmLeft);
  ledcWrite(CH_MOT_DIR_IN1, pwmRight);
  ledcWrite(CH_MOT_DIR_IN2, 0);
  motorsEnabled = true;
}

void turnRight() {
  ledcWrite(CH_MOT_ESQ_IN1, pwmLeft);
  ledcWrite(CH_MOT_ESQ_IN2, 0);
  ledcWrite(CH_MOT_DIR_IN1, 0);
  ledcWrite(CH_MOT_DIR_IN2, pwmRight);
  motorsEnabled = true;
}

// =========================
// MPU
// =========================
bool initMPU() {
  mpuError = "";
  if (!mpu.begin(MPU_ADDR, &Wire)) {
    mpuState = INIT_FAIL;
    mpuError = "MPU6050 nao encontrado no I2C";
    return false;
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  mpuState = INIT_OK;
  return true;
}

void readMPU() {
  if (mpuState != INIT_OK) return;

  sensors_event_t a, g, temp;
  if (mpu.getEvent(&a, &g, &temp)) {
    ax_g = a.acceleration.x;
    ay_g = a.acceleration.y;
    az_g = a.acceleration.z;
    gx_dps = g.gyro.x;
    gy_dps = g.gyro.y;
    gz_dps = g.gyro.z;
    temp_c = temp.temperature;
  }
}

// =========================
// TOF
// =========================
bool startTofWithAddress(Adafruit_VL53L0X &sensor, uint8_t newAddr, String &errRef) {
  errRef = "";
  if (!sensor.begin(newAddr, false, &Wire)) {
    errRef = "Falha ao iniciar VL53L0X";
    return false;
  }
  return true;
}

bool initToFs() {
  tofLeftError = "";
  tofFrontError = "";
  tofRightError = "";

  tofLeftState = NOT_INIT;
  tofFrontState = NOT_INIT;
  tofRightState = NOT_INIT;

  pinMode(XSHUT_TOF_ESQ, OUTPUT);
  pinMode(XSHUT_TOF_DIR, OUTPUT);

  // desliga laterais
  digitalWrite(XSHUT_TOF_ESQ, LOW);
  digitalWrite(XSHUT_TOF_DIR, LOW);
  delay(20);

  // frontal fica ligado sem xshut
  if (tofFront.begin(TOF_ADDR_FRONT, false, &Wire)) {
    tofFrontState = INIT_OK;
  } else {
    tofFrontState = INIT_FAIL;
    tofFrontError = "Falha ToF frontal";
  }

  // esquerdo
  digitalWrite(XSHUT_TOF_ESQ, HIGH);
  delay(20);
  if (startTofWithAddress(tofLeft, TOF_ADDR_LEFT, tofLeftError)) {
    tofLeftState = INIT_OK;
  } else {
    tofLeftState = INIT_FAIL;
  }

  // direito
  digitalWrite(XSHUT_TOF_DIR, HIGH);
  delay(20);
  if (startTofWithAddress(tofRight, TOF_ADDR_RIGHT, tofRightError)) {
    tofRightState = INIT_OK;
  } else {
    tofRightState = INIT_FAIL;
  }

  return (tofLeftState == INIT_OK || tofFrontState == INIT_OK || tofRightState == INIT_OK);
}

int readSingleToF(Adafruit_VL53L0X &sensor, InitState st, int offsetMm) {
  if (st != INIT_OK) return -1;

  VL53L0X_RangingMeasurementData_t measure;
  sensor.rangingTest(&measure, false);

  if (measure.RangeStatus != 4) {
    int val = (int)measure.RangeMilliMeter - offsetMm;
    if (val < 0) val = 0;
    return val;
  }
  return -1;
}

void readToFs() {
  distLeft = readSingleToF(tofLeft, tofLeftState, offsetEsq);
  distFront = readSingleToF(tofFront, tofFrontState, offsetFrnt);
  distRight = readSingleToF(tofRight, tofRightState, offsetDir);
}

// =========================
// INIT GERAL
// =========================
void initSensorsSafe() {
  initMPU();
  initToFs();
}

// =========================
// WEB JSON
// =========================
String jsonStatus() {
  String s = "{";
  s += "\"tofLeftState\":" + String((int)tofLeftState) + ",";
  s += "\"tofFrontState\":" + String((int)tofFrontState) + ",";
  s += "\"tofRightState\":" + String((int)tofRightState) + ",";
  s += "\"mpuState\":" + String((int)mpuState) + ",";

  s += "\"tofLeftError\":\"" + tofLeftError + "\",";
  s += "\"tofFrontError\":\"" + tofFrontError + "\",";
  s += "\"tofRightError\":\"" + tofRightError + "\",";
  s += "\"mpuError\":\"" + mpuError + "\",";

  s += "\"distLeft\":" + String(distLeft) + ",";
  s += "\"distFront\":" + String(distFront) + ",";
  s += "\"distRight\":" + String(distRight) + ",";

  s += "\"ax\":" + String(ax_g, 3) + ",";
  s += "\"ay\":" + String(ay_g, 3) + ",";
  s += "\"az\":" + String(az_g, 3) + ",";
  s += "\"gx\":" + String(gx_dps, 3) + ",";
  s += "\"gy\":" + String(gy_dps, 3) + ",";
  s += "\"gz\":" + String(gz_dps, 3) + ",";
  s += "\"temp\":" + String(temp_c, 2) + ",";

  s += "\"encLeft\":" + String(encLeftCount) + ",";
  s += "\"encRight\":" + String(encRightCount) + ",";
  s += "\"pwmLeft\":" + String(pwmLeft) + ",";
  s += "\"pwmRight\":" + String(pwmRight) + ",";
  s += "\"motorsEnabled\":" + String(motorsEnabled ? "true" : "false");
  s += "}";
  return s;
}

// =========================
// ROTAS
// =========================
void setupRoutes() {
  server.on("/", HTTP_GET, []() {
    server.send_P(200, "text/html; charset=utf-8", INDEX_HTML);
  });

  server.on("/status", HTTP_GET, []() {
    server.send(200, "application/json", jsonStatus());
  });

  server.on("/init", HTTP_GET, []() {
    initSensorsSafe();
    server.send(200, "application/json", jsonStatus());
  });

  server.on("/retry", HTTP_GET, []() {
    initSensorsSafe();
    server.send(200, "application/json", jsonStatus());
  });

  server.on("/pwm", HTTP_GET, []() {
    if (!server.hasArg("left") || !server.hasArg("right")) {
      server.send(400, "application/json", "{\"error\":\"parametros left/right ausentes\"}");
      return;
    }
    setMotorPWM(server.arg("left").toInt(), server.arg("right").toInt());
    server.send(200, "application/json", jsonStatus());
  });

  server.on("/move", HTTP_GET, []() {
    if (!server.hasArg("cmd")) {
      server.send(400, "application/json", "{\"error\":\"cmd ausente\"}");
      return;
    }

    String cmd = server.arg("cmd");

    if (cmd == "forward") moveForward();
    else if (cmd == "backward") moveBackward();
    else if (cmd == "left") turnLeft();
    else if (cmd == "right") turnRight();
    else if (cmd == "stop") stopMotors();
    else {
      server.send(400, "application/json", "{\"error\":\"comando invalido\"}");
      return;
    }

    server.send(200, "application/json", jsonStatus());
  });

  server.onNotFound([]() {
    server.send(404, "application/json", "{\"error\":\"rota nao encontrada\"}");
  });

  server.begin();
}

// =========================
// SETUP
// =========================
void setup() {
  Serial.begin(115200);
  delay(200);

  Wire.begin(SDA_PIN, SCL_PIN, 400000);

  pinMode(ENC_ESQ_C1, INPUT_PULLUP);
  pinMode(ENC_ESQ_C2, INPUT_PULLUP);
  pinMode(ENC_DIR_C1, INPUT_PULLUP);
  pinMode(ENC_DIR_C2, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(ENC_ESQ_C1), isrEncLeft, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_DIR_C1), isrEncRight, CHANGE);

  motorsInit();
  stopMotors();

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);

  setupRoutes();

  initSensorsSafe();

  Serial.println("Sistema pronto.");
  Serial.print("IP AP: ");
  Serial.println(WiFi.softAPIP());
}

// =========================
// LOOP
// =========================
void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastSensorRead >= SENSOR_PERIOD_MS) {
    lastSensorRead = now;
    readMPU();
    readToFs();
  }

  delay(2);
}