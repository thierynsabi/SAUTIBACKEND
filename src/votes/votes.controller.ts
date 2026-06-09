import { Controller, Post, Delete, Param, UseGuards, ParseUUIDPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Votes')
@Controller('votes')
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Post('issue/:issueId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote for an issue' })
  vote(@Param('issueId', ParseUUIDPipe) issueId: string, @CurrentUser() user: any) {
    return this.votesService.vote(issueId, user.id);
  }

  @Delete('issue/:issueId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove vote from an issue' })
  unvote(@Param('issueId', ParseUUIDPipe) issueId: string, @CurrentUser() user: any) {
    return this.votesService.unvote(issueId, user.id);
  }
}
