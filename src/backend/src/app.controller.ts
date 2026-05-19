import { Controller, Get, Post, Body } from '@nestjs/common';
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
    return { status: 'sucesso', mensagem: 'Dados recebidos e salvos no Firebase!' };
  }
}