import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class PostVelBatDto {
  @IsString({ message: 'id_corrida deve ser uma string!' })
  @IsNotEmpty({ message: 'id_corrida não pode estar vazio ou faltar!' })
  id_corrida!: string;

  @IsNumber({}, { message: 'PostVelBatDto: velocidade deve ser um número!' })
  @IsNotEmpty({ message: 'PostVelBatDto: velocidade não pode estar vazio!' })
  velocidade!: number;

  @IsNumber({}, { message: 'PostVelBatDto: corrente deve ser um número!' })
  @IsNotEmpty({ message: 'PostVelBatDto: corrente não pode estar vazio!' })
  corrente!: number;

  @IsNumber({}, { message: 'PostVelBatDto: tensao deve ser um número!' })
  @IsNotEmpty({ message: 'PostVelBatDto: tensao não pode estar vazio!' })
  tensao!: number;

  @IsNumber({}, { message: 'PostVelBatDto: mah_restante deve ser um número!' })
  @IsNotEmpty({ message: 'PostVelBatDto: mah_restante não pode estar vazio!' })
  mah_restante!: number;
}
