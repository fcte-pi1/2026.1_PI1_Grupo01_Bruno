import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs'; 

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db!: admin.database.Database;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const credentialsPath = this.configService.get<string>('FIREBASE_CREDENTIALS_PATH');
    const databaseURL = this.configService.get<string>('FIREBASE_DATABASE_URL');

    if (!credentialsPath || !databaseURL) {
      console.error('Erro: Variáveis do Firebase ausentes no arquivo .env');
      return;
    }

    if (!admin.apps.length) {
      const absolutePath = path.resolve(process.cwd(), credentialsPath);

      const rawJson = fs.readFileSync(absolutePath, 'utf8');
      const templateJson = JSON.parse(rawJson);

      const finalCredentials = {
        type: this.configService.get<string>(templateJson.type) as string,
        project_id: this.configService.get<string>(templateJson.project_id) as string,
        private_key_id: this.configService.get<string>(templateJson.private_key_id) as string,
        private_key: this.configService.get<string>(templateJson.private_key)?.replace(/\\n/g, '\n') as string,
        client_email: this.configService.get<string>(templateJson.client_email) as string,
        client_id: this.configService.get<string>(templateJson.client_id) as string,
        auth_uri: this.configService.get<string>(templateJson.auth_uri) as string,
        token_uri: this.configService.get<string>(templateJson.token_uri) as string,
        auth_provider_x509_cert_url: this.configService.get<string>(templateJson.auth_provider_x509_cert_url) as string,
        client_x509_cert_url: this.configService.get<string>(templateJson.client_x509_cert_url) as string,
        universe_domain: this.configService.get<string>(templateJson.universe_domain) as string,
      };

      admin.initializeApp({
        credential: admin.credential.cert(finalCredentials as any),
        databaseURL: databaseURL,
      });
    }

    this.db = admin.database();
    console.log('Firebase Realtime Database conectado via JSON Template + .env!');
  }

  async saveTelemetry(data: any) {
    const ref = this.db.ref('telemetry');
    return await ref.push(data);
  }

  async obterCorridas() {
    const ref = this.db.ref('corridas');
    const snapshot = await ref.once('value');
    return snapshot.val();
  }

  async obterCorridaPorId(id: string) {
    const ref = this.db.ref(`corridas/${id}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
  }
  
  getDb(): admin.database.Database {
    return this.db;
  }
}




