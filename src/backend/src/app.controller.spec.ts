import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';
import { TelemetryGateway } from './telemetry/telemetry/telemetry.gateway';

describe('AppController', () => {
  let appController: AppController;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    saveTelemetry: jest.fn().mockResolvedValue(true),
    obterCorridas: jest.fn(),
    obterCorridaPorId: jest.fn(),
  };

  const mockTelemetryGateway = {
    server: {
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: TelemetryGateway, useValue: mockTelemetryGateway },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    firebaseService = app.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(appController).toBeDefined();
  });

  describe('GET /corridas', () => {
    it('deve retornar a lista de corridas', async () => {
      const corridasMock = { id1: { metadados: { status: 'concluido' } } };
      mockFirebaseService.obterCorridas.mockResolvedValue(corridasMock);

      const resultado = await appController.listarCorridas();
      expect(resultado).toEqual({ status: 'sucesso', dados: corridasMock });
      expect(firebaseService.obterCorridas).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /corridas/:id', () => {
    it('deve retornar uma corrida específica pelo ID', async () => {
      const corridaMock = { metadados: { status: 'em_execucao' }, telemetria: {} };
      mockFirebaseService.obterCorridaPorId.mockResolvedValue(corridaMock);

      const resultado = await appController.obterCorrida('id_123');
      expect(resultado).toEqual({ status: 'sucesso', dados: corridaMock });
      expect(firebaseService.obterCorridaPorId).toHaveBeenCalledWith('id_123');
    });

    it('deve retornar erro se a corrida não existir', async () => {
      mockFirebaseService.obterCorridaPorId.mockResolvedValue(null);

      const resultado = await appController.obterCorrida('id_invalido');
      expect(resultado).toEqual({ status: 'erro', mensagem: 'Corrida não encontrada' });
    });
  });

  describe('POST /telemetria', () => {
    it('deve salvar e emitir novaTelemetria quando velocidade presente', async () => {
      const dados = { velocidade: 0.5, corrente: 400 };

      const resultado = await appController.receberTelemetria(dados);

      expect(mockFirebaseService.saveTelemetry).toHaveBeenCalledWith(dados);
      expect(mockTelemetryGateway.server.emit).toHaveBeenCalledWith('novaTelemetria', dados);
      expect(resultado).toEqual({ status: 'sucesso', mensagem: 'Dados salvos e transmitidos!' });
    });

    it('deve emitir novaPosicao quando posicao_vetor presente', async () => {
      const dados = { posicao_vetor: 42 };

      await appController.receberTelemetria(dados);

      expect(mockTelemetryGateway.server.emit).toHaveBeenCalledWith('novaPosicao', 42);
    });

    it('deve emitir novaParede quando celula presente', async () => {
      const dados = { celula: 5, n: true, s: false };

      await appController.receberTelemetria(dados);

      expect(mockTelemetryGateway.server.emit).toHaveBeenCalledWith('novaParede', dados);
    });
  });
});