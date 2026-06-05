import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AppService {
  
  getHello(): string {
    return 'Bem-vindo à API do XAROPI!';
  }

  async deletarCorrida(id: string) {
    try {
      const ref = admin.database().ref(`corridas/${id}`);
      await ref.remove();
      return { sucesso: true, mensagem: `Corrida ${id} apagada com sucesso.` };
    } catch (error) {
      console.error('Erro ao deletar corrida no Firebase:', error);
      throw new Error('Falha ao deletar a corrida');
    }
  }
  
}