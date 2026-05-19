import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: admin.database.Database;

  constructor(private configService: ConfigService) {}

  onModuleInit() {

    const credentialsPath = this.configService.get<string>('FIREBASE_CREDENTIALS_PATH');
    const databaseURL = this.configService.get<string>('FIREBASE_DATABASE_URL');
    if (!credentialsPath || !databaseURL) {
      console.error('Erro: Variáveis de ambiente do Firebase ausentes no arquivo .env');
      return;
    }

    if (!admin.apps.length) {
      const absolutePath = path.resolve(process.cwd(), credentialsPath);

      admin.initializeApp({
        credential: admin.credential.cert(absolutePath),
        databaseURL: databaseURL,
      });
    }

    this.db = admin.database();
    console.log('Firebase Realtime Database conectado via Admin SDK!');
  }

  async saveTelemetry(data: any) {
    const ref = this.db.ref('telemetry');
    return await ref.push(data);
  }
}