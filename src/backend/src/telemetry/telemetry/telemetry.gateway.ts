import { 
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../../firebase/firebase.service';
import { PostStartDto } from '../dto/post-start.dto';
import { PostNosDto } from '../dto/post-nos.dto';
import { PostVelBatDto } from '../dto/post-vel-bat.dto';
import { PostFinishDto } from '../dto/post-finish.dto';
import { PostPosicaoAtualDto } from '../dto/post-posicao-atual.dto';
import { SendCommandDto } from '../dto/send-command.dto';
import { UsePipes, UseFilters, ValidationPipe } from '@nestjs/common';
import { WsValidationFilter } from './ws-exception.filter';

@WebSocketGateway({ cors: true })
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@UseFilters(new WsValidationFilter())
export class TelemetryGateway implements OnGatewayDisconnect {
  
  @WebSocketServer()
  server!: Server;

  private corridasAtivas: Map<string, string> = new Map();

  constructor(private readonly firebaseService: FirebaseService) {}

  @SubscribeMessage('postStart')
  async handlePostStart(@MessageBody() data: PostStartDto, @ConnectedSocket() client: Socket) {
    const db = this.firebaseService.getDb();
    const novaCorridaRef = db.ref('corridas').push(); 
    
    const idCorrida = novaCorridaRef.key as string;
    this.corridasAtivas.set(client.id, idCorrida);
    
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

    return { status: 'sucesso', id_corrida: idCorrida };
  }

  @SubscribeMessage('postNos')
  async handlePostNos(@MessageBody() data: PostNosDto) {
    const db = this.firebaseService.getDb();
    const celulaRef = db.ref(`corridas/${data.id_corrida}/labirinto/celula_${data.id_celula}`); 
    
    await celulaRef.set({
      n: data.n, s: data.s, l: data.l, o: data.o
    });

    this.server.emit('novaParede', {
      celula: data.id_celula,
      n: data.n, s: data.s, l: data.l, o: data.o
    });

    return { status: 'sucesso' };
  }

  @SubscribeMessage('postVelBat')
async handlePostVelBat(@MessageBody() data: PostVelBatDto) {
    console.log("Dados validados pelo DTO:", data); 
    const db = this.firebaseService.getDb();
    const telemetriaRef = db.ref(`corridas/${data.id_corrida}/telemetria`).push();
    await telemetriaRef.set({
        timestamp: Date.now(),
        ...data 
    });
    this.server.emit('novaTelemetria', data);

    return { status: 'sucesso' };
}

  @SubscribeMessage('postFinish')
  async handlePostFinish(@MessageBody() data: PostFinishDto, @ConnectedSocket() client: Socket) {
    const db = this.firebaseService.getDb();
    const metadadosRef = db.ref(`corridas/${data.id_corrida}/metadados`);
    
    await metadadosRef.update({
      status: 'concluido',
      fim_timestamp: Date.now(),
      bateria_final: data.bateria_final
    });

    this.corridasAtivas.delete(client.id);

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

    this.server.emit('novaPosicao', data.posicao);

    return { status: 'sucesso' };
  }

  @SubscribeMessage('sendcomand')
  async handleSendCommand(@MessageBody() data: SendCommandDto) {
    this.server.emit('receiveCommand', data);
    return { status: 'comando_encaminhado' };
  }

  async handleDisconnect(client: Socket) {
    const id_corrida = this.corridasAtivas.get(client.id);
    
    if (id_corrida) {
      const db = this.firebaseService.getDb();
      const metadadosRef = db.ref(`corridas/${id_corrida}/metadados`);
      
      await metadadosRef.update({
        status: 'interrompida',
        fim_timestamp: Date.now()
      });

      this.corridasAtivas.delete(client.id);
      console.log(`[ALERTA] Conexão perdida. Corrida ${id_corrida} marcada como interrompida.`);
    }
  }
}