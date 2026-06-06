import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryGateway } from './telemetry.gateway';
import { FirebaseService } from '../../firebase/firebase.service';

describe('TelemetryGateway', () => {
  let gateway: TelemetryGateway;

  const mockEmit = jest.fn();
  const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });

  const mockRef = {
    push: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
    once: jest.fn().mockResolvedValue({ val: () => null }),
    key: 'fake-id-123',
  };

  const mockDb = {
    ref: jest.fn().mockReturnValue(mockRef),
  };

  const mockFirebaseService = {
    getDb: jest.fn().mockReturnValue(mockDb),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryGateway,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    gateway = module.get<TelemetryGateway>(TelemetryGateway);

    // Corrige o erro "Cannot read properties of undefined (reading 'to')"
    gateway.server = {
      to: mockTo,
      emit: mockEmit,
    } as any;
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(gateway).toBeDefined();
  });

  describe('postStart', () => {
    it('deve registrar o início de uma corrida e retornar o ID', async () => {
      const dto = { num_cell: 16, bat_total: 100, bat_inicial: 8.4 };
      const clienteMock = { id: 'socket-123' } as any;

      const resultado = await gateway.handlePostStart(dto, clienteMock);

      expect(mockDb.ref).toHaveBeenCalledWith('corridas');
      expect(mockRef.push).toHaveBeenCalled();
      expect(mockRef.set).toHaveBeenCalled();
      expect(mockTo).toHaveBeenCalledWith('telemetria_viva_room');
      expect(mockEmit).toHaveBeenCalledWith('corrida_atualizada', expect.objectContaining({ mode: 'live', reset: true }));
      expect(resultado).toEqual({ status: 'sucesso', id_corrida: 'fake-id-123' });
    });
  });

  describe('postNos', () => {
    it('deve salvar paredes e emitir novaParede', async () => {
      const dto = { id_corrida: 'fake-id-123', id_celula: 5, n: true, s: false, l: true, o: false };

      const resultado = await gateway.handlePostNos(dto);

      expect(mockDb.ref).toHaveBeenCalledWith('corridas/fake-id-123/labirinto/celula_5');
      expect(mockRef.set).toHaveBeenCalledWith({ n: true, s: false, l: true, o: false });
      expect(mockEmit).toHaveBeenCalledWith('novaParede', expect.objectContaining({ celula: 5 }));
      expect(resultado).toEqual({ status: 'sucesso' });
    });
  });

  describe('postVelBat', () => {
    it('deve salvar telemetria e emitir novaTelemetria', async () => {
      const dto = { id_corrida: 'fake-id-123', velocidade: 0.5, corrente: 400, tensao: 7.4, mah_restante: 800 };

      const resultado = await gateway.handlePostVelBat(dto);

      expect(mockRef.set).toHaveBeenCalledWith(expect.objectContaining({ velocidade: 0.5, corrente: 400 }));
      expect(mockEmit).toHaveBeenCalledWith('novaTelemetria', dto);
      expect(resultado).toEqual({ status: 'sucesso' });
    });
  });

  describe('postFinish', () => {
    it('deve finalizar a corrida e atualizar o status', async () => {
      const dto = { id_corrida: 'fake-id-123', bateria_final: 700 };
      const clienteMock = { id: 'socket-123' } as any;

      const resultado = await gateway.handlePostFinish(dto, clienteMock);

      expect(mockRef.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'concluido', bateria_final: 700 }));
      expect(resultado).toEqual({ status: 'sucesso' });
    });
  });

  describe('post_posicao_atual', () => {
    it('deve atualizar posição e emitir novaPosicao', async () => {
      const dto = { id_corrida: 'fake-id-123', posicao: 42 };

      const resultado = await gateway.handlePostPosicaoAtual(dto);

      expect(mockRef.update).toHaveBeenCalledWith(expect.objectContaining({ posicao_vetor: 42 }));
      expect(mockEmit).toHaveBeenCalledWith('novaPosicao', 42);
      expect(resultado).toEqual({ status: 'sucesso' });
    });
  });

  describe('sendcomand', () => {
    it('deve encaminhar o comando e retornar sucesso', async () => {
      const dto = { id_corrida: 'fake-id-123', comando: 'iniciar' };

      const resultado = await gateway.handleSendCommand(dto);

      expect(mockEmit).toHaveBeenCalledWith('receiveCommand', dto);
      expect(resultado).toEqual({ status: 'comando_encaminhado' });
    });
  });

  describe('handleDisconnect', () => {
    it('deve marcar corrida como interrompida se cliente tinha corrida ativa', async () => {
      const clienteMock = { id: 'socket-123' } as any;
      // Simula que esse cliente tinha uma corrida ativa
      (gateway as any).corridasAtivas.set('socket-123', 'fake-id-123');

      await gateway.handleDisconnect(clienteMock);

      expect(mockRef.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'interrompida' }));
    });

    it('não deve fazer nada se cliente não tinha corrida ativa', async () => {
      const clienteMock = { id: 'sem-corrida' } as any;
      mockDb.ref.mockClear();

      await gateway.handleDisconnect(clienteMock);

      expect(mockDb.ref).not.toHaveBeenCalled();
    });
  });

  describe('handleConnection', () => {
    it('deve emitir session_init vazio se não houver corridas', async () => {
      const clienteMock = {
        handshake: { query: { role: 'frontend' } },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      await gateway.handleConnection(clienteMock);

      expect(clienteMock.join).toHaveBeenCalledWith('telemetria_viva_room');
      expect(clienteMock.emit).toHaveBeenCalledWith('session_init', { mode: 'empty', corrida: null });
    });

    it('não deve fazer nada se role não for frontend', async () => {
      const clienteMock = {
        handshake: { query: { role: 'sensor' } },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      await gateway.handleConnection(clienteMock);

      expect(clienteMock.join).not.toHaveBeenCalled();
    });
  });
});