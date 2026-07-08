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

interface TelemetriaEstado {
    inicioTimestamp: number;
    ultimoTimestamp: number;
    distanciaAcumulada: number;
}

@WebSocketGateway({ cors: true })
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@UseFilters(new WsValidationFilter())
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    // ANTES: private corridasAtivas: Map<string, string> = new Map();
    // Esse Map era indexado por client.id (socket), mas quem chama postStart (frontend)
    // e quem chama postFinish (ESP/firmware) são sockets DIFERENTES. Isso fazia o delete
    // em handlePostFinish nunca remover a entrada certa, e o handleDisconnect do frontend
    // (ex.: fechar a aba) sobrescrevia o status de corridas já concluídas para 'interrompida'.
    //
    // Como só existe 1 frontend + 1 corrida por vez (garantido), trocamos o Map por uma
    // referência única: qual corrida está em execução agora, sem depender de qual socket
    // fez qual chamada.
    private corridaEmExecucao: string | null = null;

    private corridaAtual: string | null = null;
    // Mapa para guardar a última posição conhecida por corrida
    private ultimaPosicao: Map<string, number> = new Map();
    // Mapa para acumular distância/tempo por corrida (usado para completar o payload de telemetria)
    private telemetriaEstado: Map<string, TelemetriaEstado> = new Map();

    // Guarda o socket.id da ESP atualmente conectada, e se ela já foi confirmada.
    private firmwareSocketId: string | null = null;

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly offlineService: OfflineService
    ) {}

    async handleConnection(client: Socket) {
        const role = client.handshake.query.role;
        console.log(`[WS] Novo cliente conectado. id=${client.id} role=${role}`);

        if (role === 'firmware') {
            await this.handleFirmwareConnection(client);
            return;
        }

        if (role !== 'frontend') {
            console.log(`[WS] Cliente ignorado. role=${role}`);
            return;
        }

        await this.handleFrontendConnection(client);
    }

    // ==========================================
    // CONEXÃO DA ESP (firmware)
    // ==========================================
    private async handleFirmwareConnection(client: Socket) {
        // Se já havia uma ESP conectada com outro socket (ex.: reconexão), avisamos e substituímos.
        if (this.firmwareSocketId && this.firmwareSocketId !== client.id) {
            console.log(`[WS] Substituindo firmware anterior (${this.firmwareSocketId}) por novo socket (${client.id}).`);
        }

        this.firmwareSocketId = client.id;

        // Confirmação de aplicação para a própria ESP (distinta do ACK de transporte do Socket.IO).
        client.emit('firmware_ack', {
            status: 'conectado',
            timestamp: Date.now()
        });

        // Avisa o(s) frontend(s) que a ESP está online, para exibir status de conexão do robô.
        this.server.to('telemetria_viva_room').emit('firmware_status', {
            online: true,
            timestamp: Date.now()
        });

        console.log(`[WS] Firmware confirmado. socket.id=${client.id}`);
    }

    // ==========================================
    // CONEXÃO DO FRONTEND
    // ==========================================
    private async handleFrontendConnection(client: Socket) {
        client.join('telemetria_viva_room');

        // Junto com o session_init, já informa o status atual de conexão da ESP.
        client.emit('firmware_status', {
            online: this.firmwareSocketId !== null,
            timestamp: Date.now()
        });

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

        // Marca a corrida como "em execução" de forma independente de qual socket chamou.
        this.corridaEmExecucao = idCorrida;
        this.corridaAtual = idCorrida;
        this.ultimaPosicao.set(idCorrida, 0); // Inicializa posição em 0

        const agora = Date.now();
        this.telemetriaEstado.set(idCorrida, {
            inicioTimestamp: agora,
            ultimoTimestamp: agora,
            distanciaAcumulada: 0
        });

        try {
            await novaCorridaRef.set({
                metadados: {
                    status: 'em_execucao',
                    inicio_timestamp: agora,
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

        // Acumula distância e tempo decorrido no servidor, já que a ESP não envia esses campos.
        const agora = Date.now();
        let estado = this.telemetriaEstado.get(data.id_corrida);
        if (!estado) {
            estado = { inicioTimestamp: agora, ultimoTimestamp: agora, distanciaAcumulada: 0 };
            this.telemetriaEstado.set(data.id_corrida, estado);
        }

        const deltaSegundos = Math.max(0, (agora - estado.ultimoTimestamp) / 1000);
        estado.distanciaAcumulada += data.velocidade * deltaSegundos;
        estado.ultimoTimestamp = agora;

        const tempoDecorrido = (agora - estado.inicioTimestamp) / 1000;

        const novaLeitura = {
            timestamp: agora,
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

        // Payload completo, com os campos que o frontend realmente consome em tempo real
        // (status, tempoMedio e distancia estavam faltando antes).
        this.server.to('telemetria_viva_room').emit('novaTelemetria', {
            status: 'em_execucao',
            tempoMedio: tempoDecorrido.toFixed(3),
            velocidade: data.velocidade,
            distancia: estado.distanciaAcumulada,
            corrente: data.corrente,
            tensao: data.tensao,
            posicao: posicaoAtual,
            timestamp: agora
        });

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

        // Antes: this.corridasAtivas.delete(client.id) — não fazia nada, pois quem chama
        // postFinish é a ESP, e a chave gravada em postStart era o socket do frontend.
        // Agora: limpamos a referência única, desde que seja a mesma corrida (garante que
        // um postFinish "atrasado" de uma corrida antiga não apague o controle de uma nova).
        if (this.corridaEmExecucao === data.id_corrida) {
            this.corridaEmExecucao = null;
        }
        this.ultimaPosicao.delete(data.id_corrida);
        this.telemetriaEstado.delete(data.id_corrida);
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

        if (data.comando === 'cancelar') {
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

            // Mesma lógica: só limpa a referência única se for a corrida que estava de fato ativa.
            if (this.corridaEmExecucao === data.id_corrida) {
                this.corridaEmExecucao = null;
            }
            this.ultimaPosicao.delete(data.id_corrida);
            this.telemetriaEstado.delete(data.id_corrida);
        }
        return { status: 'comando_encaminhado' };
    }

    async handleDisconnect(client: Socket) {
        // Se quem caiu foi a ESP, avisa o frontend que ela ficou offline.
        if (this.firmwareSocketId === client.id) {
            this.firmwareSocketId = null;
            this.server.to('telemetria_viva_room').emit('firmware_status', {
                online: false,
                timestamp: Date.now()
            });
            console.log('[WS] Firmware desconectado.');
            return;
        }

        // Antes: buscava this.corridasAtivas.get(client.id). Como só existe 1 frontend por
        // vez (garantido), usamos diretamente a referência única de corrida em execução —
        // não precisa mais casar client.id com quem chamou postStart.
        const id_corrida = this.corridaEmExecucao;
        if (id_corrida) {
            const db = this.firebaseService.getDb();
            const metadadosRef = db.ref(`corridas/${id_corrida}/metadados`);

            try {
                await metadadosRef.update({ status: 'interrompida', fim_timestamp: Date.now() });
            } catch (error) {}

            this.corridaEmExecucao = null;
            this.ultimaPosicao.delete(id_corrida);
            this.telemetriaEstado.delete(id_corrida);
            console.log(`[ALERTA] Conexão perdida. Corrida ${id_corrida} marcada como interrompida.`);
        }
    }
}