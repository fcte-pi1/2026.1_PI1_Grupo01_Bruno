#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// Definição explícita dos pinos I2C para o ESP32-S3
#define SDA_PIN 8
#define SCL_PIN 9

#define accel_offset_x -0.85
#define accel_offset_y -0.13
#define accel_offset_z -1.62
#define gyro_offset_x 0.02
#define gyro_offset_y 0.0
#define gyro_offset_z 0.02

Adafruit_MPU6050 mpu;

void setup(void) {
	Serial.begin(115200);
	delay(3000); // Dá tempo para o USB CDC (Nativo do S3) inicializar no PC

	Serial.println("Inicializando MPU6050");

	// Inicializa o barramento I2C nos pinos específicos do S3
	Wire.begin(SDA_PIN, SCL_PIN);

	if (!mpu.begin()) {
		Serial.println("Falha ao encontrar o MPU6050. Verifique as conexões SDA(8) e SCL(9)!");
		while (1) { delay(10); }
	}
	Serial.println("MPU6050 Encontrado!");

	mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
	mpu.setGyroRange(MPU6050_RANGE_500_DEG);
	mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);

    // Cabeçalho CSV
    Serial.println("acc_x,acc_y,acc_z,gyro_x,gyro_y,gyro_z,temp");
}

void loop() {

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    Serial.print((a.acceleration.x+accel_offset_x));
    Serial.print(",");
    Serial.print((a.acceleration.y+accel_offset_y));
    Serial.print(",");
    Serial.print((a.acceleration.z+accel_offset_z));
    Serial.print(",");
    Serial.print((g.gyro.x+gyro_offset_x));
    Serial.print(",");
    Serial.print((g.gyro.y+gyro_offset_y));
    Serial.print(",");
    Serial.print((g.gyro.z+gyro_offset_z));
    Serial.print(",");
    Serial.println(temp.temperature);

    delay(500);
}