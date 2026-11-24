import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';
import { VoterIdentityService } from './voter-identity.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebsitesController],
  providers: [WebsitesService, VoterIdentityService],
  exports: [WebsitesService, VoterIdentityService],
})
export class WebsitesModule {}
