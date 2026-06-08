import { IsString, IsNotEmpty } from 'class-validator';
export class SendCommandDto {
  @IsString({ message: 'SendCommandDto deve ser uma string!' })
  @IsNotEmpty({ message: 'SendCommandDto não pode estar vazio ou faltar!' })
  id_corrida!: string;

  @IsString({ message: 'SendCommandDto: comando deve ser uma string!' })
  @IsNotEmpty({ message: 'SendCommandDto: comando não pode estar vazio ou faltar!' })
  comando!: string;
}
