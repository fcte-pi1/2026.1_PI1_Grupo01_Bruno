import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service'; 

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService 
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('telemetria')
  async receberTelemetria(@Body() dados: any) {
    await this.firebaseService.saveTelemetry(dados);
    return { status: 'sucesso', mensagem: 'Dados salvos!' };
  }

  //  NOVAS ROTAS PARA O FRONT-END 

  @Get('corridas')
  async listarCorridas() {
    const dados = await this.firebaseService.obterCorridas();
    return { status: 'sucesso', dados };
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