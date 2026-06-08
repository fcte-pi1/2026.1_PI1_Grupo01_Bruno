import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { FirebaseService } from './../src/firebase/firebase.service';
import { AppService } from './../src/app.service';

const request = require('supertest');

describe('Integração Back-end <-> Firebase (e2e)', () => {
  let app: INestApplication;
  let idCorridaTeste: string = 'corrida_fake_123';

  beforeAll(async () => {
   
    const mockFirebase = {
      saveTelemetry: jest.fn().mockResolvedValue(true),
      obterCorridas: jest.fn().mockResolvedValue({ 'corrida_fake_123': { status: 'Em execução' } }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue(mockFirebase)
      .compile();

    app = moduleFixture.createNestApplication();
    
    
    const appService = app.get(AppService);
    jest.spyOn(appService, 'deletarCorrida').mockResolvedValue({ sucesso: true, mensagem: 'apagado' } as any);

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
      .expect(201); 

    expect(response.body.status).toBe('sucesso');
  });

  it('/corridas (GET) - Deve listar as corridas do Firebase', async () => {
    const response = await request(app.getHttpServer())
      .get('/corridas')
      .expect(200);

    expect(response.body.status).toBe('sucesso');
    expect(response.body.dados).toBeDefined();
  });

  it('/corridas/:id (DELETE) - Deve apagar a corrida no Firebase', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/corridas/${idCorridaTeste}`)
      .expect(200);

    expect(response.body.sucesso).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});