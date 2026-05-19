# XAROPi - Software do Micromouse

## Tecnologias utilizadas

1. **Vite + Typescript + React** para o frontend;
2. **Node.js com NestJS** para o backend;
3. **Firebase Realtime Database** para o banco de dados.

## Requisitos Mínimos

- [Node.js](https://nodejs.org/) v20 ou superior
- npm v10 ou superior
- Git

---

## Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/fcte-pi1/2026.1_PI1_Grupo01_Bruno.git
cd 2026.1_PI1_Grupo01_Bruno
```

### 2. Configure as variáveis de ambiente

**Backend:**

```bash
cd src/backend
cp .env.example .env
```

Edite o `src/backend/.env` com os valores necessários:

```env
PORT=3000
```

**Frontend:**

```bash
cd ../frontend
cp .env.example .env
```

Edite o `src/frontend/.env` com os valores necessários:

```env
VITE_API_URL=http://localhost:3000
```
---

## Rodando o Projeto

Abra **dois terminais** na raiz do projeto.

### Terminal 1 — Backend

```bash
cd src/backend
npm install
npm run start:dev
```
O servidor estará disponível em: `http://localhost:3000`

### Terminal 2 — Frontend

```bash
cd src/frontend
npm install
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

---

## Rodar testes
### Backend

```bash
# testes unitários
$ npm run test

# testes e2e
$ npm run test:e2e

# cobertura de testes
$ npm run test:cov
```

<!-- ### Frontend

```bash

``` -->

## Estrutura do projeto

A estrutura principal de arquivos do projeto consiste em:

```bash
src
├───backend/      # API NestJS (porta 3000)
│   ├───src/ 
│   │   ├───app.controller.spec.ts 
│   │   ├───app.controller.ts       
│   │   ├───app.module.ts          
│   │   ├───app.service.ts         
│   │   └───main.ts
│   └───test/                      
├───frontend/     # React + Vite (porta 5173)
│    └──src/
│       ├───assets/
│       ├───components/
│       └───App.tsx
└───firmware/     # Código da ESP32
    
```