import { IsNumber, IsNotEmpty } from 'class-validator';

export class PostStartDto {
  @IsNumber({}, { message: 'PostStartDto: num_cell deve ser um número!' })
  @IsNotEmpty({ message: 'PostStartDto: num_cell não pode estar vazio ou faltar!' })
  num_cell!: number;
  
  @IsNumber({}, { message: 'PostStartDto: bat_total deve ser um número!' })
  @IsNotEmpty({ message: 'PostStartDto: bat_total não pode estar vazio!' })
  bat_total!: number;

  @IsNumber({}, { message: 'PostStartDto: bat_inicial deve ser um número!' })
  @IsNotEmpty({ message: 'PostStartDto: bat_inicial não pode estar vazio!' })
  bat_inicial!: number;
}