import { Module } from '@nestjs/common';
import { MpAccountsController } from './mp-accounts.controller';
import { MpAccountsService } from './mp-accounts.service';

@Module({
  controllers: [MpAccountsController],
  providers: [MpAccountsService],
  exports: [MpAccountsService],
})
export class MpAccountsModule {}
