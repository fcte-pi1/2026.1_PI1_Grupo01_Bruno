import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PostVelBatDto {
  @IsString()
  @IsNotEmpty()
  id_corrida!: string;
  @IsString() @IsOptional() qtdTestes?: string;
  @IsString() @IsOptional() taxaSucesso?: string;
  @IsString() @IsOptional() tempoMedio?: string;
  @IsString() @IsOptional() velMedia?: string;
  @IsString() @IsOptional() energia?: string;
  @IsString() @IsOptional() latencia?: string;
  @IsOptional() velocidade?: any; 
  @IsOptional() corrente?: any;
  @IsOptional() tensao?: any;
  @IsOptional() mah_restante?: any;
  @IsOptional() distancia?: number | string;
  @IsOptional() amperagem?: number | string;
  @IsOptional() voltagem?: number | string;
}