import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service'; 
import { TelemetryGateway } from './telemetry/telemetry/telemetry.gateway';

@Controller()
export class AppController {
  
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService,
    private readonly gateway: TelemetryGateway
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('telemetria')
  async receberTelemetria(@Body() dados: any) {
    await this.firebaseService.saveTelemetry(dados);

    if (dados.velocidade !== undefined || dados.corrente !== undefined) {
      this.gateway.server.emit('novaTelemetria', dados);
    }
    
    if (dados.posicao_vetor !== undefined) { 
      this.gateway.server.emit('novaPosicao', dados.posicao_vetor);
    }

    if (dados.celula !== undefined || dados.n !== undefined) { 
      this.gateway.server.emit('novaParede', dados);
    }

    return { status: 'sucesso', mensagem: 'Dados salvos e transmitidos!' };
  }

  @Get('corridas')
  async listarCorridas() {
    const dados = await this.firebaseService.obterCorridas();
    return { status: 'sucesso', dados };
  }

  @Delete('corridas/:id')
  async deletarCorrida(@Param('id') id: string) {
    return await this.appService.deletarCorrida(id);
  }

  @Get('corridas/:id')
  async obterCorrida(@Param('id') id: string) {
    const dados = await this.firebaseService.obterCorridaPorId(id);
    if (!dados) {
      return { status: 'erro', mensagem: 'Corrida não encontrada' };
    }
    return { status: 'sucesso', dados };
  }
}