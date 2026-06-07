
#include <Wire.h>
#include <Adafruit_VL53L0X.h>

#define SDA_PIN 8
#define SCL_PIN 9

Adafruit_VL53L0X lox = Adafruit_VL53L0X();

void setup() {
	Serial.begin(115200);
	delay(3000);

	Serial.println("Inicializando VL53L0X...");
	
	Wire.begin(SDA_PIN, SCL_PIN);
	
	if (!lox.begin()) {
		Serial.println("Falha ao iniciar o VL53L0X. Verifique SDA(8) e SCL(9).");
		while(1);
	}
	Serial.println("VL53L0X Iniciado com sucesso!");
}

void loop() {
	VL53L0X_RangingMeasurementData_t measure;
	
	lox.rangingTest(&measure, false); 

	if (measure.RangeStatus != 4) { 
		//Serial.print("Distância: "); 
		Serial.println((measure.RangeMilliMeter-20));
		//Serial.println(" mm");
	} else {
		//Serial.println("Fora de alcance");
		Serial.println(-1); 
	}
		
	delay(250);
}