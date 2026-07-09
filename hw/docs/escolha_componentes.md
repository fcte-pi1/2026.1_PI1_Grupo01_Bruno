## BMS (Battery Management System)
Esse componente é responsável por manter a integridade das nossas baterias. A princípio, propomos o modelo **MS-20A-3S-S**. Vale considerar que esse modelo pode ser alterado dependendo das decisões da equipe de consumo energético, então é relevante incorporar a avaliação deles antes de fechar a escolha.  

**Link do produto:**  
<https://shopee.com.br/product/1425075406/20899865224>

---

## Motor
Para o motor do projeto, foi escolhido um **motor DC 6V 750RPM**. O modelo já possui encoder integrado (permite medir a velocidade de rotação) e caixa de redução (aumenta o torque).  

Apesar de ser mais caro que algumas alternativas, a escolha tende a reduzir complexidade e evitar problemas comuns em soluções com encoder externo.  

**Link do produto:**  
<https://www.robocore.net/motor-caixas-de-reducao/micro-motor-caixa-de-reducao-6v-750rpm-com-encoder>

---

## Sensor de Obstáculo / Profundidade
Esses sensores são responsáveis pela detecção das paredes do labirinto e identificação da sala objetivo. As alternativas consideradas foram:
- Sensores infravermelhos  
- Sensores ultrassônicos  
- Sensores ToF  

A decisão foi focar em ToF, principalmente pela maior disponibilidade de documentação técnica. Como sensor ToF, foi selecionado o **VL53L0X**. A proposta é utilizar **3 unidades** para melhorar o mapeamento do ambiente ao redor do micromouse.  

**Link do produto:**  
<https://www.makerhero.com/produto/sensor-de-distancia-a-laser-vl53l0x-de-alta-precisao>

---

## Ponte H
A Ponte H é responsável pelo controle dos motores. Foi escolhido um módulo baseado no **L298N**, por atender aos requisitos do projeto e ser amplamente utilizado em aplicações similares.  

**Link do produto:**  
<https://www.robocore.net/driver-motor/driver-motor-ponte-h-l298n>

---

## Sensor de Posição
Esses sensores determinam **posição, velocidade e orientação** do micromouse. As alternativas consideradas incluem:
- Encoders nas rodas  
- Sensores inerciais (acelerômetro e giroscópio)  

A proposta atual é:
- Utilizar **encoders** para estimar deslocamento  
- Utilizar **giroscópio** para medir orientação  

Essa abordagem adiciona redundância e melhora a confiabilidade. Como os motores já possuem encoders integrados, a implementação é simplificada.  

Para o giroscópio, considera-se o **MPU-6050**, que integra acelerômetro e giroscópio.  

**Link do produto:**  
<https://www.robocore.net/sensor-robo/acelerometro-e-giroscopio-mpu6050>

---

## Regulador de Tensão
O regulador de tensão é necessário para adequar a tensão das baterias à alimentação da **ESP32**. Foi escolhido um módulo baseado no **LM2596**, por apresentar custo baixo e desempenho adequado para o projeto.  

**Link do produto:**  
<https://www.robocore.net/regulador-de-tensao/modulo-regulador-de-tensao-ajustavel-lm2596-3a>