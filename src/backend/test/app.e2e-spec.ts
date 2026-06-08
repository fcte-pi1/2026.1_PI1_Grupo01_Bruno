import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';

describe('Integração Back-end <-> Firebase (e2e)', () => {
  let app: INestApplication;
  let idCorridaTeste: string;

 
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

 
  it('/ (GET) - Healthcheck', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  
  it('/telemetria (POST) - Deve salvar dados do robô no Firebase', async () => {
    
    const payloadRobo = {
      id_corrida: 'teste_integracao_pc2',
      status: 'Em execução',
      tempoMedio: 10.5,
      velMedia: 0.5,
      bateria: 900
    };

    const response = await request(app.getHttpServer())
      .post('/telemetria')
      .send(payloadRobo)
      .expect(201); // 201 Created

    expect(response.body.status).toBe('sucesso');
  });

  
  it('/corridas (GET) - Deve listar as corridas do Firebase', async () => {
    const response = await request(app.getHttpServer())
      .get('/corridas')
      .expect(200);

    expect(response.body.status).toBe('sucesso');
    expect(response.body.dados).toBeDefined();
    
    
    if (response.body.dados) {
        const ids = Object.keys(response.body.dados);
        if(ids.length > 0) idCorridaTeste = ids[0];
    }
  });

 
  it('/corridas/:id (DELETE) - Deve apagar a corrida no Firebase', async () => {
    
    if (!idCorridaTeste) return; 

    const response = await request(app.getHttpServer())
      .delete(`/corridas/${idCorridaTeste}`)
      .expect(200);

    expect(response.body.sucesso).toBe(true);
  });

 
  afterAll(async () => {
    await app.close();
  });
});