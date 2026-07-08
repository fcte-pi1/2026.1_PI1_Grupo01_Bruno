import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryGateway } from './telemetry/telemetry.gateway';

import { FirebaseService } from '../firebase/firebase.service';

@Module({
  imports: [ConfigModule], 
  providers: [TelemetryGateway, FirebaseService],
  exports: [TelemetryGateway]
})
export class TelemetryModule {}