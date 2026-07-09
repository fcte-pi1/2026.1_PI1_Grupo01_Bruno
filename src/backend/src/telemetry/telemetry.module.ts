import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryGateway } from './telemetry/telemetry.gateway';
import { FirebaseService } from '../firebase/firebase.service';
import { OfflineService } from '../offline/offline.service';

@Module({
  imports: [ConfigModule], 
  providers: [TelemetryGateway, FirebaseService, OfflineService],
  exports: [TelemetryGateway]
})
export class TelemetryModule {}