import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// O caminho do gateway precisa apontar para a subpasta
import { TelemetryGateway } from './telemetry/telemetry.gateway';

import { FirebaseService } from '../firebase/firebase.service';

@Module({
  imports: [ConfigModule], // Necessário porque o FirebaseService usa ele
  providers: [TelemetryGateway, FirebaseService],
})
export class TelemetryModule {}