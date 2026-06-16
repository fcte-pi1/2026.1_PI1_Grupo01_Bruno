# Estruturas

## 1. Projeto Mecânico do Chassi

O projeto mecânico do chassi do micromouse foi desenvolvido com foco em otimização do espaço interno, facilidade de manutenção, distribuição equilibrada de massa e integração eficiente entre os subsistemas mecânico, eletrônico e energético. A estrutura apresenta dimensões aproximadas de **130 mm de comprimento, 100 mm de largura e 50 mm de altura**.

O chassi foi concebido com geometria parcialmente oca, visando reduzir o peso total da estrutura sem comprometer significativamente sua rigidez mecânica. Para isso, foram incorporadas regiões internas vazadas e paredes estruturais otimizadas, permitindo uma melhor relação entre massa e resistência estrutural.

### 1.1 Compartimento da Bateria

O compartimento da bateria foi posicionado na região inferior do chassi, contribuindo para um **centro de gravidade mais baixo** e, consequentemente, maior estabilidade dinâmica durante a navegação. Esse compartimento possui:

- Aberturas laterais destinadas à ventilação;
- Espaço interno reservado para futura implementação de soluções de isolamento térmico;
- Tampa removível com encaixe por pressão, permitindo a substituição rápida da bateria durante competições sem necessidade de ferramentas adicionais;
- Abertura dedicada à passagem de fiação elétrica e integração com o sistema eletrônico principal.

### 1.2 Placa de Controle

A placa principal de controle foi posicionada na região superior central do chassi, permitindo integração simplificada entre sensores, módulos eletrônicos e sistema de alimentação, além de facilitar o acesso para manutenção e futuras modificações no sistema.

### 1.3 Sistema de Tração

O sistema de tração é composto por dois motores DC com encoder, fixados simetricamente nas laterais do chassi por meio de suportes estruturais integrados:

- **Rodas laterais:** 32 mm de diâmetro;
- **Apoio frontal:** roda boba, conferindo estabilidade em três pontos de contato com o solo.

---

## 2. Seleção do Material do Chassi

O chassi é fabricado por **impressão 3D**. Para a escolha do filamento, foram avaliados fatores como resistência mecânica, resistência térmica, facilidade de fabricação e custo de prototipagem.

### 2.1 Material: PETG

O **PETG** foi o material selecionado para a fabricação da estrutura, pelos seguintes motivos:

| Propriedade | Detalhe |
|:---|:---|
| Resistência a impactos | Superior ao PLA, garantindo integridade estrutural |
| Resistência térmica | 76 °C a 85 °C sem deformações significativas |
| Adesão entre camadas | Boa coesão, reduz falhas em regiões submetidas a vibrações |
| Disponibilidade | Ampla disponibilidade comercial e baixo custo relativo |

---

## 3. Memorial de Cálculo

### 3.1 Massa e Centro de Gravidade

O memorial de cálculo tem o intuito de dar clareza à parte estrutural do veículo. É esperado que o micromouse complete o percurso sem tombamentos e oscilações, tornando necessário o cálculo da massa e do centro de gravidade para evitar problemas no deslocamento.

<p align="center">Tabela 1 - Componentes e seus pesos</p>

| Componente | Massa (g) | Quantidade | Função |
|:---|:---:|:---:|:---|
| ESP32 | 5,0 | 1 | Microcontrolador principal |
| Motor DC com encoder | 19,0 | 2 | Movimentação |
| Driver de motor | 2,0 | 1 | Controle dos motores |
| Bateria LiPo | 40,0 | 1 | Alimentação do sistema |
| Sensor ToF VL53L0X | 2,0 | 3 | Detecção de paredes |
| Roda S20 32mm | 23,0 | 2 | Suporte e deslocamento |
| Chassi (PETG) | 158,7 | 1 | Estrutura de suporte dos componentes |

<p align="center">Fonte: Autoria do Grupo</p>

O **peso total estimado do veículo é de aproximadamente 327,2 gramas**, sendo o peso do chassi estimado pelo software de CAD utilizado.

---

## 4. Testes de Estrutura e Prototipagem

Para o refinamento da estrutura do micromouse, foram fabricados por impressão 3D, utilizando materiais **PETG e PLA**, três versões do chassi, duas versões da tampa do compartimento da bateria e dois suportes de fixação.

### 4.1 Modificações entre Versões

Entre o projeto conceitual e a versão final, foram realizadas as seguintes modificações:

- **Ajuste dos diâmetros dos furos** para compatibilidade com insertos metálicos comerciais;
- **Inclusão de ressaltos** na base do sistema eletrônico para evitar interferências com componentes e pontos de solda localizados na face inferior da placa eletrônica;
- **Alteração do sistema de encaixe da tampa** e reposicionamento da saída de fiação, proporcionando melhor acomodação dos cabos;
- **Realocação dos sensores ToF** das laterais da placa eletrônica para as faces externas do chassi.

Essas alterações resultaram em uma melhor integração entre os componentes do sistema, contribuindo para **maior robustez estrutural e facilidade de montagem**.
