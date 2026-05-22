import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { FirebaseService } from '../../firebase/firebase.service';
import { PostStartDto } from '../dto/post-start.dto';
import { PostNosDto } from '../dto/post-nos.dto';
import { PostVelBatDto } from '../dto/post-vel-bat.dto';
import { PostFinishDto } from '../dto/post-finish.dto';
import { PostPosicaoAtualDto } from '../dto/post-posicao-atual.dto';
import { SendCommandDto } from '../dto/send-command.dto';

@WebSocketGateway({ cors: true })
export class TelemetryGateway {
  
  constructor(private readonly firebaseService: FirebaseService) {}

  @SubscribeMessage('postStart')
  async handlePostStart(@MessageBody() data: PostStartDto, @ConnectedSocket() client: Socket) {
    console.log(`🚀 [postStart] Recebido do cliente: ${client.id}`);
    const db = this.firebaseService.getDb();
    const novaCorridaRef = db.ref('corridas').push(); 
    
    await novaCorridaRef.set({
      metadados: {
        status: 'em_execucao',
        inicio_timestamp: Date.now(),
        fim_timestamp: null,
        dimensao_labirinto: data.num_cell,
        bateria_total: data.bat_total,
        bateria_inicial: data.bat_inicial,
        bateria_final: null
      },
      labirinto: {},
      telemetria: {}
    });

    return { status: 'sucesso', id_corrida: novaCorridaRef.key };
  }

  @SubscribeMessage('postNos')
  async handlePostNos(@MessageBody() data: PostNosDto) {
    const db = this.firebaseService.getDb();
    const celulaRef = db.ref(`corridas/${data.id_corrida}/labirinto/celula_${data.id_celula}`); 
    
    await celulaRef.set({
      n: data.n, s: data.s, l: data.l, o: data.o
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('postVelBat')
  async handlePostVelBat(@MessageBody() data: PostVelBatDto) {
    const db = this.firebaseService.getDb();
    const telemetriaRef = db.ref(`corridas/${data.id_corrida}/telemetria`).push();
    
    await telemetriaRef.set({
      timestamp: Date.now(),
      velocidade: data.velocidade,
      corrente: data.corrente,
      tensao: data.tensao,
      mah_restante: data.mah_restante
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('postFinish')
  async handlePostFinish(@MessageBody() data: PostFinishDto) {
    console.log(`🏁 [postFinish] Corrida ${data.id_corrida} finalizada!`);
    const db = this.firebaseService.getDb();
    const metadadosRef = db.ref(`corridas/${data.id_corrida}/metadados`);
    
    // O update() altera apenas os campos especificados sem apagar o resto
    await metadadosRef.update({
      status: 'concluido',
      fim_timestamp: Date.now(),
      bateria_final: data.bateria_final
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('post_posicao_atual')
  async handlePostPosicaoAtual(@MessageBody() data: PostPosicaoAtualDto) {
    const db = this.firebaseService.getDb();
    
    // Atualiza apenas o estado atual para o Front-end ler rapidamente, 
    // tratando o labirinto como vetor.
    const estadoRef = db.ref(`corridas/${data.id_corrida}/estado_atual`);
    
    await estadoRef.update({
      posicao_vetor: data.posicao,
      timestamp: Date.now()
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('sendcomand')
  async handleSendCommand(
    @MessageBody() data: SendCommandDto,
    @ConnectedSocket() client: Socket
  ) {
    console.log(`[sendcomand] Comando '${data.comando}' repassado para a corrida ${data.id_corrida}`);
    
    // O servidor recebe o comando do Front-end e emite de volta para a ESP32 ouvir
    client.broadcast.emit('receiveCommand', data);
    
    return { status: 'comando_encaminhado' };
  }
}