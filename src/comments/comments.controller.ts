import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to issue' })
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.commentsService.create(dto, user.id);
  }

  @Get('issue/:issueId')
  @ApiOperation({ summary: 'Get all comments for an issue' })
  findByIssue(@Param('issueId', ParseUUIDPipe) issueId: string) {
    return this.commentsService.findByIssue(issueId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment (owner or Admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.commentsService.remove(id, user.id, user.role);
  }
}
