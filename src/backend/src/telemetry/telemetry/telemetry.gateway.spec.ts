import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryGateway } from './telemetry.gateway';
import { FirebaseService } from '../../firebase/firebase.service';

describe('TelemetryGateway', () => {
  let gateway: TelemetryGateway;

  // 1.  mocks para a cadeia de funções do Firebase (ref().push().set())
  const mockRef = {
    push: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
    key: 'fake-id-123',
  };

  const mockDb = {
    ref: jest.fn().mockReturnValue(mockRef),
  };

  // 2. Mock do FirebaseService que será injetado no Gateway
  const mockFirebaseService = {
    getDb: jest.fn().mockReturnValue(mockDb),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryGateway,
        { provide: FirebaseService, useValue: mockFirebaseService }, // Injetando o Mock aqui!
      ],
    }).compile();

    gateway = module.get<TelemetryGateway>(TelemetryGateway);
  });

  it('deve estar definido', () => {
    expect(gateway).toBeDefined();
  });

  // 3. Teste para garantir que o postStart funciona e chama o banco corretamente
  describe('postStart', () => {
    it('deve registrar o início de uma corrida e retornar o ID', async () => {
      const dto = { num_cell: 16, bat_total: 100, bat_inicial: 8.4 };
      const clienteMock = {} as any; // Simula o socket do cliente

      const resultado = await gateway.handlePostStart(dto, clienteMock);

      expect(mockDb.ref).toHaveBeenCalledWith('corridas');
      expect(mockRef.push).toHaveBeenCalled();
      expect(mockRef.set).toHaveBeenCalled();
      expect(resultado).toEqual({ status: 'sucesso', id_corrida: 'fake-id-123' });
    });
  });
});