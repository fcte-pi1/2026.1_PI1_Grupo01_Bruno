import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  database: jest.fn().mockReturnValue({
    ref: jest.fn().mockReturnValue({
      remove: jest.fn().mockResolvedValue(true),
    }),
  }),
}));

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('deve retornar a mensagem de boas-vindas', () => {
      expect(service.getHello()).toBe('Bem-vindo à API do XAROPI!');
    });
  });

  describe('deletarCorrida', () => {
    it('deve deletar uma corrida e retornar sucesso', async () => {
      const resultado = await service.deletarCorrida('corrida-123');

      expect(admin.database().ref).toHaveBeenCalledWith('corridas/corrida-123');
      expect(resultado).toEqual({
        sucesso: true,
        mensagem: 'Corrida corrida-123 apagada com sucesso.',
      });
    });

    it('deve lançar erro se o Firebase falhar', async () => {
      const mockRef = { remove: jest.fn().mockRejectedValue(new Error('Firebase error')) };
      (admin.database().ref as jest.Mock).mockReturnValueOnce(mockRef);

      await expect(service.deletarCorrida('corrida-123')).rejects.toThrow('Falha ao deletar a corrida');
    });
  });
});