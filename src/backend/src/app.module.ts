import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase/firebase.service';
import { TelemetryModule } from './telemetry/telemetry.module';
import { OfflineService } from './offline/offline.service';
import { OfflineController } from './offline/offline.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelemetryModule
  ],
  controllers: [
    AppController, 
    OfflineController
  ],
  providers: [
    AppService, 
    FirebaseService,
    OfflineService
  ],
})
export class AppModule {}