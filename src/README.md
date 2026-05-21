# XAROPi - Software do Micromouse

## 1. Tecnologias utilizadas

1. **Vite + Typescript + React** para o frontend;
2. **Node.js com NestJS** para o backend;
3. **Firebase Realtime Database** para o banco de dados.

## 2. Requisitos Mínimos

- [Node.js](https://nodejs.org/) v20 ou superior
- npm v10 ou superior
- Git

---

## 3. Configuração Inicial

### 3.1 Clone o repositório

```bash
git clone https://github.com/fcte-pi1/2026.1_PI1_Grupo01_Bruno.git
cd 2026.1_PI1_Grupo01_Bruno
```

### 3.2 Configure as variáveis de ambiente


#### 3.2.1 Variáveis do Backend

1. Solicite o arquivo `.env` para algum responsável do projeto (este arquivo contém chaves privadas que não devem ser versionadas no Git).

2. Crie o `.env` do backend

    ```bash
    cd src/backend
    cp .env.example .env
    ```

2. Edite o `src/backend/.env` com os valores corretos

#### 3.2.2 Variáveis do Frontend


1. Crie o `.env` do frontend

    ```bash
    cd ../frontend
    cp .env.example .env
    ```

2. Edite o `src/frontend/.env` com os valores necessários:

    ```env
    VITE_API_URL=http://localhost:3000
    ```

### 3.3 Acesso ao Console do Firebase

Para visualizar e gerenciar os dados do banco através do [Console do Firebase](https://xaropi-default-rtdb.firebaseio.com/), siga as instruções abaixo:

1. O acesso ao painel do Firebase é restrito aos membros autorizados do grupo.

2. Solicite a um membro da equipe que já seja administrador do projeto para que envie um convite de acesso para o seu e-mail.

3. Utilize a conta Google que foi vinculada ao projeto para realizar o login no Console do Firebase.

## 4. Rodando o Projeto

Abra **dois terminais** na raiz do projeto.

### 4.1 Terminal 1 — Backend

```bash
cd src/backend
npm install
npm run start:dev
```
O servidor estará disponível em: `http://localhost:3000`

### 4.2 Terminal 2 — Frontend

```bash
cd src/frontend
npm install
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`


## 5. Rodar testes

### 5.1 Backend

```bash
# testes unitários
$ npm run test

# testes e2e
$ npm run test:e2e

# cobertura de testes
$ npm run test:cov
```

### 5.2 Frontend

```bash

``` 

## 6. Estrutura do projeto

A estrutura principal de arquivos do projeto consiste em:

```bash
src
├───backend/      # API NestJS (porta 3000)
│   ├───src/ 
│   │   ├───Firebase/ 
│   │   │    ├───firebase.service.ts
│   │   ├───app.controller.spec.ts 
│   │   ├───app.controller.ts       
│   │   ├───app.module.ts          
│   │   ├───app.service.ts         
│   │   └───main.ts
│   └───test/   
│   └───.env   
│   └───.env.example
│   └───firebase-credentials-templatejson                    
├───frontend/     # React + Vite (porta 5173)
│   └──src/
│   │   ├───assets/
│   │   ├───components/
│   │   └───App.tsx
│   └───.env  
└───firmware/     # Código da ESP32
    
```