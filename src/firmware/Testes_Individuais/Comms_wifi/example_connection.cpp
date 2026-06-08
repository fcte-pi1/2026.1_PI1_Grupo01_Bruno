#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "nome_wifi";
const char* password = "senha_wifi";

// server fictício
const char* serverName = "http://jsonplaceholder.typicode.com/posts/1";

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  Serial.println("Conectando ao Wi-Fi");
  while(WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Conectado! IP local: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    Serial.print("\nIniciando requisicao HTTP... ");
    
    // Inicializa a comunicação com o link do servidor
    http.begin(serverName);
    
    int httpResponseCode = http.GET();
    
    // Se o código for maior que zero, o servidor respondeu
    if (httpResponseCode > 0) {
      Serial.print("Codigo de resposta HTTP: ");
      Serial.println(httpResponseCode); // Se printar 200, quer dizer que deu certo
      
      String payload = http.getString();
      Serial.println("Conteudo recebido do servidor:");
      Serial.println(payload);
    }
    else {
      Serial.print("Erro na requisicao. Codigo: ");
      Serial.println(httpResponseCode);
    }
    
    // Fecha a conexão para liberar os recursos da ESP
    http.end();
  } else {
    Serial.println("Wi-Fi desconectado! Tentando reconectar...");
  }
  
  // Aguarda 10 segundos antes de fazer o próximo teste
  delay(10000);
}