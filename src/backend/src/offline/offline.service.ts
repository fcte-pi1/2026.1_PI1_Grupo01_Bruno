import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class OfflineService {
  private readonly filePath = path.join(process.cwd(), 'telemetria-offline.json');

  async salvar(dados: any) {
    console.log('Tentando salvar o arquivo em:', this.filePath);
    let cache = await this.lerCache();
    cache.push(dados);
    await fs.writeFile(this.filePath, JSON.stringify(cache, null, 2));
  }

  async lerCache(): Promise<any[]> {
    try {
      const conteudo = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(conteudo);
    } catch (error) {
      // Se o arquivo não existir, retorna um array vazio
      return [];
    }
  }

  async limparCache() {
    await fs.writeFile(this.filePath, JSON.stringify([]));
  }
}