import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../../firebase/firebase.service';
import { PostStartDto } from '../dto/post-start.dto';
import { PostNosDto } from '../dto/post-nos.dto';
import { PostVelBatDto } from '../dto/post-vel-bat.dto';
import { PostFinishDto } from '../dto/post-finish.dto';
import { PostPosicaoAtualDto } from '../dto/post-posicao-atual.dto';
import { SendCommandDto } from '../dto/send-command.dto';

@WebSocketGateway({ cors: true })
export class TelemetryGateway {
  
  
  @WebSocketServer()
  server!: Server;

  constructor(private readonly firebaseService: FirebaseService) {}

  @SubscribeMessage('postStart')
  async handlePostStart(@MessageBody() data: PostStartDto, @ConnectedSocket() client: Socket) {
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
    const db = this.firebaseService.getDb();
    const metadadosRef = db.ref(`corridas/${data.id_corrida}/metadados`);
    
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
    const estadoRef = db.ref(`corridas/${data.id_corrida}/estado_atual`);
    
    await estadoRef.update({
      posicao_vetor: data.posicao,
      timestamp: Date.now()
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('sendcomand')
  async handleSendCommand(@MessageBody() data: SendCommandDto) {
    
    this.server.emit('receiveCommand', data);
    return { status: 'comando_encaminhado' };
  }
}