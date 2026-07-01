import { Controller, Post } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { FirebaseService } from '../firebase/firebase.service'; // Ajuste o caminho se necessário

@Controller('sincronizar')
export class OfflineController {
  constructor(
    private readonly offlineService: OfflineService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  async sincronizarFirebase() {
    const dadosPendentes = await this.offlineService.lerCache();
    
    if (dadosPendentes.length === 0) {
      return { status: 'sucesso', message: 'Nenhum dado pendente para sincronizar.' };
    }

    const db = this.firebaseService.getDb();
    let count = 0;

    try {
      // Percorre o cache e envia cada leitura de volta pro Firebase
      for (const item of dadosPendentes) {
        if (item.id_corrida && item.telemetria) {
          const ref = db.ref(`corridas/${item.id_corrida}/telemetria`).push();
          await ref.set(item.telemetria);
          count++;
        }
      }

      // Se o loop terminar sem erros (internet está ok)limpa o cache local
      await this.offlineService.limparCache();
      
      console.log(`[OFFLINE] Sincronização concluída: ${count} pacotes enviados.`);
      return { status: 'sucesso', message: `${count} registros sincronizados com Firebase!` };
      
    } catch (error) {
      console.error('[OFFLINE] Erro ao sincronizar dados. A internet ainda está instável?', error);
      return { status: 'erro', message: 'Falha ao sincronizar. Os dados continuam salvos localmente.' };
    }
  }
}