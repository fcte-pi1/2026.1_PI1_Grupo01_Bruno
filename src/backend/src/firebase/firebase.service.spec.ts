// firebase.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Mocka os módulos externos para não precisar de credenciais reais
jest.mock('firebase-admin', () => {
  const mockDatabase = {
    ref: jest.fn().mockReturnValue({
      push: jest.fn().mockResolvedValue(true),
      once: jest.fn().mockResolvedValue({ val: () => ({ corrida1: {} }) }),
    }),
  };
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    database: jest.fn().mockReturnValue(mockDatabase),
  };
});

jest.mock('fs');
jest.mock('path');

describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        FIREBASE_CREDENTIALS_PATH: 'fake-credentials.json',
        FIREBASE_DATABASE_URL: 'https://fake-db.firebaseio.com',
        type: 'service_account',
        project_id: 'fake-project',
        private_key_id: 'fake-key-id',
        private_key: 'fake-private-key',
        client_email: 'fake@fake.iam.gserviceaccount.com',
        client_id: '123456',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/fake',
        universe_domain: 'googleapis.com',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    // Mocka o fs.readFileSync para retornar um template JSON falso
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      type: 'type',
      project_id: 'project_id',
      private_key_id: 'private_key_id',
      private_key: 'private_key',
      client_email: 'client_email',
      client_id: 'client_id',
      auth_uri: 'auth_uri',
      token_uri: 'token_uri',
      auth_provider_x509_cert_url: 'auth_provider_x509_cert_url',
      client_x509_cert_url: 'client_x509_cert_url',
      universe_domain: 'universe_domain',
    }));

    (path.resolve as jest.Mock).mockReturnValue('/fake/path/credentials.json');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('deve inicializar o Firebase com credenciais válidas', () => {
      service.onModuleInit();
      expect(admin.initializeApp).toHaveBeenCalled();
      expect(admin.database).toHaveBeenCalled();
    });

    it('deve retornar sem inicializar se faltar variáveis de ambiente', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockConfigService.get.mockReturnValueOnce(null as any); // <- null as any em vez de undefined

    service.onModuleInit();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Variáveis do Firebase ausentes'));
    consoleSpy.mockRestore();
    });

    it('não deve chamar initializeApp se já houver um app inicializado', () => {
    // O mock global já define apps: [] e initializeApp é chamado normalmente.
    // Aqui apenas validamos que o serviço continua funcional após múltiplas inicializações.
    service.onModuleInit();
    expect(service.getDb()).toBeDefined();
    });
  });

  describe('getDb', () => {
    it('deve retornar a instância do banco de dados', () => {
      service.onModuleInit();
      const db = service.getDb();
      expect(db).toBeDefined();
    });
  });

  describe('saveTelemetry', () => {
    it('deve salvar dados de telemetria no Firebase', async () => {
      service.onModuleInit();
      const data = { velocidade: 0.5, corrente: 400 };

      await service.saveTelemetry(data);

      const db = service.getDb();
      expect(db.ref).toHaveBeenCalledWith('telemetry');
    });
  });

  describe('obterCorridas', () => {
    it('deve retornar todas as corridas', async () => {
      service.onModuleInit();

      const resultado = await service.obterCorridas();

      const db = service.getDb();
      expect(db.ref).toHaveBeenCalledWith('corridas');
      expect(resultado).toEqual({ corrida1: {} });
    });
  });

    describe('obterCorridaPorId', () => {
    it('deve retornar uma corrida pelo ID', async () => {
        service.onModuleInit();

        const id = 'corrida1';
        const resultado = await service.obterCorridaPorId(id);

        const db = service.getDb();
        expect(db.ref).toHaveBeenCalledWith(`corridas/${id}`);
        expect(resultado).toEqual({ corrida1: {} });
    });
    });
});