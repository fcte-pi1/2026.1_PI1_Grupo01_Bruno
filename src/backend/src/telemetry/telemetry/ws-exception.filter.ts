import { Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsValidationFilter extends BaseWsExceptionFilter{
   catch(exception: any, host: ArgumentsHost) {
       const client = host.switchToWs().getClient();
       const callback = host.getArgByIndex(2);
       let detalhesErro: any = 'Erro interno desconhecido';

       if(exception instanceof BadRequestException){
            const response = exception.getResponse() as any;

            if(response && response.message){
                detalhesErro = response.message;
            } else{
                detalhesErro=response;
            }
       }
       else if(exception&& exception.message){
            detalhesErro = exception.message;
       }

       const errorPayload = {
        status: 'erro',
        mensagem: 'Falha na Validação do DTO (Formato de dado inválido)',
        detalhes: detalhesErro,
       };

       if (typeof callback === 'function'){
            callback(errorPayload);
       }else{
            client.emit('exception, errorPayLoad');
       }
   }
}