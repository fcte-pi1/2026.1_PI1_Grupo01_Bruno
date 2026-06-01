import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class PostFinishDto {
  @IsString({ message: 'PostFinishDto: id_corrida deve ser uma string!' })
  @IsNotEmpty({ message: 'PostFinishDto: id_corrida não pode estar vazio ou faltar!' })
  id_corrida!: string;

  @IsNumber({}, { message: 'PostFinishDto: bateria_final deve ser um número!' })
  @IsNotEmpty({ message: 'PostFinishDto: bateria_final não pode estar vazio!' })
  bateria_final!: number;
}
