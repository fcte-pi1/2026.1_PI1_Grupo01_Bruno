  import { 
      WebSocketGateway,
      SubscribeMessage,
      MessageBody,
      ConnectedSocket,
      WebSocketServer,
      OnGatewayConnection,
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
  import { OfflineService } from 'src/offline/offline.service'; 

  @WebSocketGateway({ cors: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @UseFilters(new WsValidationFilter())
  export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer()
    server!: Server;

    private corridasAtivas: Map<string, string> = new Map();
    private corridaAtual: string | null = null;
    // Mapa para guardar a última posição conhecida por corrida
    private ultimaPosicao: Map<string, number> = new Map(); 

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly offlineService: OfflineService
    ) {}

    async handleConnection(client: Socket) {
    console.log("Novo cliente conectado!");
    console.log("Handshake:", client.handshake.query);

    const role = client.handshake.query.role;

    if (role !== 'frontend') {
      console.log(`Cliente ignorado. role = ${role}`);
      return;
    }
      
      client.join('telemetria_viva_room');

      try {
        const db = this.firebaseService.getDb();
        const snapshot = await db.ref('corridas').once('value');
        const data = snapshot.val();

        if (!data) {
          client.emit('session_init', { mode: 'empty', corrida: null });
          return;
        }

        const corridas = Object.entries(data) as any[];
        const getMaisRecente = (lista: any[]) =>
          lista
            .sort((a, b) => (a[1].metadados?.inicio_timestamp ?? 0) - (b[1].metadados?.inicio_timestamp ?? 0))
            .at(-1);

        const ativa = getMaisRecente(corridas.filter(([_, c]) => c?.metadados?.status === 'em_execucao'));

        if (ativa) {
          const [id, corrida] = ativa;
          this.corridaAtual = id;
          client.emit('session_init', { mode: 'live', corrida: this.formatCorrida({ id, ...corrida }) });
          return;
        }

        const ultima = getMaisRecente(corridas.filter(([_, c]) => c?.metadados?.status === 'concluido'));

        if (ultima) {
          const [id, corrida] = ultima;
          this.corridaAtual = id;
          client.emit('session_init', { mode: 'replay', corrida: this.formatCorrida({ id, ...corrida }) });
          return;
        }

        client.emit('session_init', { mode: 'empty', corrida: null });
      } catch (error) {
        console.error('[OFFLINE] Não foi possível carregar as corridas na conexão inicial.');
        client.emit('session_init', { mode: 'empty', corrida: null });
      }
    }

    private formatCorrida(corrida: any) {
      return {
        id: corrida.id,
        metadados: corrida.metadados,
        telemetria: Object.values(corrida.telemetria ?? {}),
      };
    }

    @SubscribeMessage('postStart')
    async handlePostStart(@MessageBody() data: PostStartDto, @ConnectedSocket() client: Socket) {
      const db = this.firebaseService.getDb();
      const novaCorridaRef = db.ref('corridas').push();

      const idCorrida = novaCorridaRef.key as string;
      this.corridasAtivas.set(client.id, idCorrida);
      this.corridaAtual = idCorrida;
      this.ultimaPosicao.set(idCorrida, 0); // Inicializa posição em 0

      try {
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
      } catch (error) {
        console.log('[OFFLINE] Salvamento de nova corrida falhou no Firebase.');
        // Implementar redundância aqui também se necessário no futuro
      }

      this.server.to('telemetria_viva_room').emit('corrida_atualizada', { mode: 'live', id_corrida: idCorrida, reset: true });
      return { status: 'sucesso', id_corrida: idCorrida };
    }

    @SubscribeMessage('postNos')
    async handlePostNos(@MessageBody() data: PostNosDto) {
      const db = this.firebaseService.getDb();
      const celulaRef = db.ref(`corridas/${data.id_corrida}/labirinto/celula_${data.id_celula}`); 
      
      try {
        await celulaRef.set({ n: data.n, s: data.s, l: data.l, o: data.o });
      } catch (error) {
        console.log('[OFFLINE] Falha ao gravar célula da parede no Firebase.');
      }

      this.server.emit('novaParede', { celula: data.id_celula, n: data.n, s: data.s, l: data.l, o: data.o });
      
      return { status: 'sucesso' };
    }

    @SubscribeMessage('postVelBat')
    async handlePostVelBat(@MessageBody() data: PostVelBatDto) {
      const db = this.firebaseService.getDb();
      const telemetriaRef = db.ref(`corridas/${data.id_corrida}/telemetria`).push();
        
      const posicaoAtual = this.ultimaPosicao.get(data.id_corrida) ?? 0;

      const novaLeitura = {
        timestamp: Date.now(),
        velocidade: data.velocidade,
        corrente: data.corrente,
        tensao: data.tensao,
        mah_restante: data.mah_restante,
        posicao_vetor: posicaoAtual 
      };

      try {
    
        const salvaFirebase = telemetriaRef.set(novaLeitura);
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase offline timeout')), 1500)
        );

        await Promise.race([salvaFirebase, timeout]);
        
      } catch (error) {
        console.log('[OFFLINE] Timeout de conexão! Salvando telemetria localmente...');
        await this.offlineService.salvar({ 
          id_corrida: data.id_corrida, 
          telemetria: novaLeitura 
        });
      }

      this.server.to('telemetria_viva_room').emit('telemetria_viva', novaLeitura);
      this.server.emit('novaTelemetria', { ...data, posicao: posicaoAtual });

      return { status: 'sucesso' };
    }

    @SubscribeMessage('postFinish')
    async handlePostFinish(@MessageBody() data: PostFinishDto, @ConnectedSocket() client: Socket) {
      const db = this.firebaseService.getDb();
      const metadadosRef = db.ref(`corridas/${data.id_corrida}/metadados`);

      try {
        await metadadosRef.update({
          status: 'concluido',
          fim_timestamp: Date.now(),
          bateria_final: data.bateria_final
        });
      } catch (error) {
        console.log('[OFFLINE] Falha ao finalizar corrida no Firebase.');
      }

      this.corridasAtivas.delete(client.id);
      this.ultimaPosicao.delete(data.id_corrida); 
      return { status: 'sucesso' };
    }

    @SubscribeMessage('post_posicao_atual')
    async handlePostPosicaoAtual(@MessageBody() data: PostPosicaoAtualDto) {
      
      this.ultimaPosicao.set(data.id_corrida, data.posicao);

      const db = this.firebaseService.getDb();
      const estadoRef = db.ref(`corridas/${data.id_corrida}/estado_atual`);

      try {
        await estadoRef.update({ posicao_vetor: data.posicao, timestamp: Date.now() });
      } catch (error) {
        console.log('[OFFLINE] Falha ao atualizar posição no Firebase.');
      }

      this.server.emit('novaPosicao', data.posicao);

      return { status: 'sucesso' };
    }

    @SubscribeMessage('sendcomand')
    async handleSendCommand(@MessageBody() data: SendCommandDto, @ConnectedSocket() client: Socket) {
      this.server.emit('receiveCommand', data);
      

      if (data.comando === 'cancelar'){
        const db = this.firebaseService.getDb();
        const metadadosRef = db.ref(`corridas/${data.id_corrida}/metadados`);

        try {
          await metadadosRef.update({
            status: 'interrompida',
            fim_timestamp: Date.now()
          });
        } catch (error) {}

        this.server.to('telemetria_viva_room').emit('novaTelemetria', {
          status: 'interrompida',
          timestamp: Date.now()
        });
        
        this.corridasAtivas.delete(client.id);
        this.ultimaPosicao.delete(data.id_corrida);
      }
      return { status: 'comando_encaminhado' };
    }

    async handleDisconnect(client: Socket) {
      const id_corrida = this.corridasAtivas.get(client.id);
      if (id_corrida) {
        const db = this.firebaseService.getDb();
        const metadadosRef = db.ref(`corridas/${id_corrida}/metadados`);

        try {
          await metadadosRef.update({ status: 'interrompida', fim_timestamp: Date.now() });
        } catch (error) {}

        this.corridasAtivas.delete(client.id);
        this.ultimaPosicao.delete(id_corrida);
        console.log(`[ALERTA] Conexão perdida. Corrida ${id_corrida} marcada como interrompida.`);
      }
    }
  }