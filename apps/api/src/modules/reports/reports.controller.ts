import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateReportSchema, CreateReportInput, ReportStatus } from '@finallinks/contracts';
import { Request } from 'express';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a broken link or website issue report (Public)' })
  async create(@Body() body: CreateReportInput, @Req() req: Request) {
    const validated = CreateReportSchema.parse(body);
    return this.reportsService.create(validated, req);
  }

  @Get('my-reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List support tickets/reports submitted by the current authenticated user',
  })
  async getMyReports(@CurrentUser() user: { id: string; email: string }) {
    return this.reportsService.getMyReports(user);
  }

  @Post('owner-ticket')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a support inquiry or report as website owner' })
  async createOwnerTicket(
    @CurrentUser() user: { id: string; email: string },
    @Body() body: { reason: string; details: string; domainId?: string },
  ) {
    return this.reportsService.createOwnerTicket(user, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('report.view')
  @ApiOperation({ summary: 'List user submitted reports (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: ReportStatus,
    @Query('search') search?: string,
  ) {
    return this.reportsService.findAll(page, limit, status, search);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('report.handle')
  @ApiOperation({ summary: 'Update report status (Admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
    @CurrentUser('id') handlerId: string,
  ) {
    return this.reportsService.updateStatus(id, status, handlerId);
  }

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('report.handle')
  @ApiOperation({ summary: 'Send email reply to a report/query (Admin)' })
  async reply(
    @Param('id') id: string,
    @Body('message') message: string,
    @CurrentUser('id') handlerId: string,
  ) {
    return this.reportsService.reply(id, message, handlerId);
  }
}
