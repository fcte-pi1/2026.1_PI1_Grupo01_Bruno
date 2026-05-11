# Tabelas de Priorização de Requisitos

## 1. Requisitos Funcionais

### 1.1 Requisitos de Hardware

<p align="center">Tabela 1 - Requisitos de Hardware</p>

| ID | Descrição | Classificação |
|:---|:---|:---|
| RF1 | O sistema deve detectar a presença ou ausência de paredes nas direções frontal, lateral esquerda e lateral direita do micromouse, compatível com as dimensões das células de 18 cm × 18 cm e paredes de 5 cm de altura. | Must |
| RF2 | O sistema deve controlar individualmente a velocidade de cada motor DC por meio de sinal PWM enviado ao driver de motor. | Must |
| RF3 | O sistema deve controlar o sentido de rotação de cada motor DC de forma independente, permitindo movimentos de avanço, recuo e curvas. | Must |
| RF4 | O sistema deve mover o micromouse em linha reta dentro dos corredores do labirinto, mantendo trajetória centralizada entre as paredes. | Must |
| RF5 | O sistema deve executar curvas de 90° e 180° de forma precisa, compatível com as dimensões das células de 18 cm × 18 cm do labirinto. | Must |
| RF6 | O sistema deve iniciar e interromper a navegação por meio de um botão físico acessível externamente no micromouse. | Should |
| RF7 | O sistema deve detectar e sinalizar quando a tensão da bateria atingir nível insuficiente para continuidade segura da navegação. | Should |
| RF8 | O sistema deve acionar um buzzer ao detectar que o micromouse atingiu a sala objetivo do labirinto. | Could |
| RF9 | O sistema deve transmitir dados de telemetria ao sistema web em tempo real. | Must |

<p align="center">Fonte: Autoria do Grupo </p>

### 1.2 Requisitos de Estruturas
| ID | Descrição | Classificação |
|:---|:---|:---|
| RF10 | O micromouse deve suportar e integrar todos os componentes necessários (bateria, sensores e controle), garantindo seu funcionamento adequado durante a operação. | Must |
| RF11 | A estrutura deve permitir que o micromouse percorra o labirinto sem interferências, respeitando limites de altura, largura e mobilidade. | Must |
| RF12 | A estrutura deve proteger os componentes eletrônicos contra choques mecânicos e possíveis danos durante o percurso. | Should |
| RF13 | A estrutura do micromouse deve permitir a substituição e atualização de módulos de forma independente. | Could |

### 1.3 Requisitos de Software
| ID | Descrição | Classificação |
|:---|:---|:---|
| RF14 | Em relação ao percurso atual, o sistema web deve exibir e atualizar em tempo real o mapeamento da localização e o trajeto do Micromouse no labirinto. | Must |
| RF15 | O sistema web deve identificar e exibir o tipo de labirinto para o percurso atual. | Must |
| RF16 | O sistema web deve exibir e atualizar em tempo real a porcentagem de bateria disponível do Micromouse. | Should |
| RF17 | O sistema web deve exibir e atualizar em tempo real a porcentagem de bateria consumida pelo Micromouse durante o trajeto. | Could |
| RF18 | O sistema web deve exibir e atualizar em tempo real um temporizador indicando o tempo decorrido até a conclusão ou interrupção do desafio. | Must |
| RF19 | Após a conclusão do percurso, o sistema web deve exibir se o desafio foi cumprido com sucesso ou não. | Must |
| RF20 | Após a conclusão do percurso, o sistema web deve exibir a velocidade média mantida pelo Micromouse. | Could |
| RF21 | O sistema web deve possuir um botão que envia comandos para iniciar e reiniciar percursos remotamente. | Must |
| RF22 | Ao iniciar o percurso, o temporizador deve ser ativado automaticamente. | Must |
| RF23 | Ao reiniciar o percurso, o sistema deve resetar o cronômetro. | Should |
| RF24 | Ao finalizar o percurso, o sistema deve enviar os dados do percurso anterior para o banco de dados. | Must |
| RF25 | Após a conclusão do desafio, os dados finais devem ser armazenados em um banco de dados, categorizados de acordo com o tipo de labirinto. | Must |
| RF26 | O sistema deve permitir a consulta e exibição de dados de qualquer trajeto específico armazenado, independentemente do tipo de labirinto. | Must |
| RF27 | O sistema web deve processar os dados recebidos do micromouse em tempo real para identificar a presença de paredes. | Must |
| RF28 | Ao detectar um obstáculo, o software deve atualizar a estrutura de dados do labirinto na interface web. | Must |
| RF29 | O sistema web deve realizar a construção progressiva de uma representação lógica (matriz ou grafo) do ambiente conforme o Micromouse explora o labirinto. | Must |
| RF30 | A troca de informações entre o Micromouse e o sistema web deve ser estabelecida através do protocolo WebSockets. | Must |

### 1.4 Requisitos de Consumo Energético
| ID | Descrição | Classificação |
|:---|:---|:---|
| RF31 | O micromouse deve possuir um indicador visual local (como LEDs de estado ou display OLED) para exibir o nível de carga da bateria sem a necessidade de dispositivos externos. | Could |
| RF32 | O sistema deve registrar o consumo de energia durante cada percurso para posterior análise no sistema web. | Must |
| RF33 | O sistema deve possuir um interruptor físico (Chave On/Off) capaz de seccionar a alimentação da bateria, interrompendo completamente o consumo de energia do dispositivo. | Must |
| RF34 | O sistema deve monitorar a tensão da bateria e, ao atingir um limiar crítico pré-definido, deve transitar automaticamente para o modo de economia de energia para estender a autonomia operacional. | Should |

## 2. Requisitos Não Funcionais

### 2.1 Consumo Energético
| ID | Descrição | Classificação |
|:---|:---|:---|
| RNF1 | Garantir funcionamento ininterrupto do sistema por, no mínimo, 20 minutos. | Must |
| RNF2 | Suportar o mapeamento completo no labirinto 16x16 sem recarga. | Must |
| RNF3 | Utilizar reguladores de tensão com rendimento energético mínimo de 85%. | Should |
| RNF4 | Limitar a corrente consumida em modo de espera a um máximo de 50mA. | Should |
| RNF5 | Implementar detecção de baixa tensão para alertar quando a célula atingir 3,2V. | Must |
| RNF6 | O sistema de alimentação não deve exceder 25% do peso total do micromouse. | Must |
| RNF7 | Permitir o carregamento das baterias sem a necessidade de desmontagem. | Must |
| RNF8 | Manter a variação de tensão nos sensores dentro de uma margem de +/- 5% durante a aceleração dos motores. | Should |

### 2.2 Estruturas
| ID | Descrição | Classificação |
|:---|:---|:---|
| RNF9 | A estrutura do micromouse deve garantir estabilidade estática e dinâmica, evitando tombamento e oscilações durante a operação. | Must |
| RNF10 | A massa total do micromouse deve ser minimizada, de modo a reduzir a inércia e melhorar a resposta dinâmica. | Should |
| RNF11 | Os componentes do micromouse devem ser fixados sem folgas, evitando vibrações e ruídos durante a operação. | Should |
| RNF12 | A estrutura do micromouse deve contribuir para a eficiência energética, minimizando perdas por atrito e massa excessiva. | Could |

### 2.3 Hardware
| ID | Descrição | Classificação |
|:---|:---|:---|
| RNF13 | A fonte de alimentação do microcontrolador e dos sensores deve ser eletricamente isolada (ou fortemente desacoplada) da alimentação dos motores. | Should |
| RNF14 | O circuito lógico deve manter uma tensão estável, mesmo quando os motores exigirem o pico máximo de corrente, no momento da partida. | Should |
| RNF15 | Sinais analógicos devem possuir filtros passa-baixa (filtros RC) no hardware para atenuar ruídos de alta frequência. | Should |
| RNF16 | A placa deve possuir um nó comum bem definido, evitando ground loops. | Must |
| RNF17 | A placa deve expor pinos ou ilhas de fácil acesso para testes via multímetro (VCC, GND, sensores, PWM). | Could |
| RNF18 | O circuito deve incluir LEDs de status integrados para condições vitais (Alimentação OK, Bateria Fraca). | Won’t |
| RNF19 | Componentes de alto risco (ESP32, Ponte H) devem utilizar soquetes para substituição em no máximo 5 minutos. | Should |
| RNF20 | O circuito de entrada da bateria deve incluir proteção contra inversão de polaridade. | Must |
| RNF21 | O algoritmo de navegação deve processar a tomada de decisão em um tempo inferior a 5 ms. | Could |
| RNF22 | A atualização da estrutura do labirinto deve ocorrer em menos de 10 ms após a leitura do sensor. | Could |

### 2.4 Software
| ID | Descrição | Classificação |
|:---|:---|:---|
| RNF23 | O sistema web deve ajustar automaticamente a escala visual do mapeamento para os três tipos de labirinto (4x4, 8x8 e 16x16). | Should |
| RNF24 | O sistema web deve exibir dados de localização com latência máxima de 200 ms. | Should |
| RNF25 | O sistema web deve exibir dados de velocidade com latência máxima de 200 ms. | Could |
| RNF26 | O sistema web deve exibir dados de bateria com latência máxima de 200 ms. | Must |
| RNF27 | O sistema web deve exibir dados de conclusão com latência máxima de 200 ms. | Could |
| RNF28 | O sistema web deve garantir que todos os dados de telemetria recebidos sejam persistidos no banco de dados. | Must |
| RNF29 | O sistema web deve exibir dados históricos em um tempo máximo de 1 segundo. | Could |
| RNF30 | Em caso de perda de conexão WebSocket, o sistema web deve tentar reconexão automática a cada 1 segundo. | Must |
| RNF31 | A interface web deve possuir debouncing nos botões de controle (intervalo menor que 500 ms). | Should |
| RNF32 | A interface web deve ser responsiva (adaptar-se a diferentes resoluções). | Could |
| RNF33 | O sistema web deve ser funcional em navegadores baseados em Chromium e WebKit. | Should |



## Histórico de Versões

| Versão | Data       | Descrição                                        | Autor(es)           | 
|--------|------------|--------------------------------------------------|-------------------------------------------------------|
| 1.0    | 11/05/2025 | Criação do arquivo        | [Othavio Araujo Bolzan](https://github.com/bolzanMGBC)| 
| 2.0    | 11/05/2025 | Adição das tabelas de requisitos funcionais e não funcionais        | [Othavio Araujo Bolzan](https://github.com/bolzanMGBC)| 