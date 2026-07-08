import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class PostPosicaoAtualDto {
  @IsString({ message: 'PostPosicaoAtualDto: id_corrida deve ser uma string!' })
  @IsNotEmpty({ message: 'PostPosicaoAtualDto: id_corrida não pode estar vazio ou faltar!' })
  id_corrida!: string;

  @IsNumber({}, { message: 'PostPosicaoAtualDto: posicao deve ser um número!' })
  @IsNotEmpty({ message: 'PostPosicaoAtualDto: posicao não pode estar vazio!' })
  posicao!: number;
}
