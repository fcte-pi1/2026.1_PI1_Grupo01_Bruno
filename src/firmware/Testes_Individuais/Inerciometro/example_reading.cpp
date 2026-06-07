#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// Definição explícita dos pinos I2C para o ESP32-S3
#define SDA_PIN 2
#define SCL_PIN 1

Adafruit_MPU6050 mpu;

void setup(void) {
	Serial.begin(115200);
	delay(3000); // Dá tempo para o USB CDC (Nativo do S3) inicializar no PC

	Serial.println("Inicializando MPU6050");

	// Inicializa o barramento I2C nos pinos específicos do S3
	Wire.begin(SDA_PIN, SCL_PIN);

	if (!mpu.begin()) {
		Serial.println("Falha ao encontrar o MPU6050. Verifique as conexões SDA(2) e SCL(1)!");
		while (1) { delay(10); }
	}
	Serial.println("MPU6050 Encontrado!");

	mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
	mpu.setGyroRange(MPU6050_RANGE_500_DEG);
	mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void loop() {
	
	sensors_event_t a, g, temp;
	mpu.getEvent(&a, &g, &temp);

	Serial.print("Aceleração X: "); Serial.print(a.acceleration.x);
	Serial.print(", Y: "); Serial.print(a.acceleration.y);
	Serial.print(", Z: "); Serial.print(a.acceleration.z);
	Serial.println(" m/s^2");

	Serial.print("Giroscópio X: "); Serial.print(g.gyro.x);
	Serial.print(", Y: "); Serial.print(g.gyro.y);
	Serial.print(", Z: "); Serial.print(g.gyro.z);
	Serial.println("°/s");

	Serial.print("Temperatura: "); Serial.print(temp.temperature);
	Serial.println(" °C");
	Serial.println("---");
	
	delay(500);

}
