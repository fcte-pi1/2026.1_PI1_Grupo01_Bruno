#include "bateria.h"

void setup() {
    Serial.begin(115200);
    bateria_init();
}

void loop() {
    float tensao = ler_tensao_bateria();
    Serial.print("Tensão: ");
    Serial.print(tensao, 2);
    Serial.println(" V");

    delay(500);
}