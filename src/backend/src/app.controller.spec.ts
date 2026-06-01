import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';

describe('AppController', () => {
  let appController: AppController;
  let firebaseService: FirebaseService;

  // um mock do FirebaseService para não acessar o banco real durante o teste
  const mockFirebaseService = {
    saveTelemetry: jest.fn(),
    obterCorridas: jest.fn(),
    obterCorridaPorId: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    firebaseService = app.get<FirebaseService>(FirebaseService);
  });

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
});