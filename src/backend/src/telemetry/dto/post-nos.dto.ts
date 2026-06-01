import { IsString, IsNotEmpty, IsNumber, IsBoolean} from 'class-validator';
export class PostNosDto {
  @IsString({ message: 'PostNosDto: id_corrida deve ser uma string!' })
  @IsNotEmpty({ message: 'PostNosDto: id_corrida não pode estar vazio ou faltar!' })
  id_corrida!: string;

  @IsNumber({}, { message: 'PostNosDto: id_celula deve ser um número!' })
  @IsNotEmpty({ message: 'PostNosDto: id_celula não pode estar vazio!' })
  id_celula!: number;

  @IsBoolean({ message: 'PostNosDto: n deve ser true ou false!' })
  n!: boolean;

  @IsBoolean({ message: 'PostNosDto: s deve ser true ou false!' })
  s!: boolean;

  @IsBoolean({ message: 'PostNosDto: l deve ser true ou false!' })
  l!: boolean;

  @IsBoolean({ message: 'PostNosDto: o deve ser true ou false!' })
  o!: boolean;
}
