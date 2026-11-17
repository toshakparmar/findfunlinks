import {
  Controller,
  Post,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Health Check')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Post('domain/:id')
  @RequirePermissions('domain.update')
  @ApiOperation({
    summary: 'Trigger an immediate SSRF-safe health check on a domain (Admin / Owner)',
  })
  async checkDomain(@Param('id') id: string) {
    return this.healthCheckService.checkDomain(id);
  }

  @Post('run-batch')
  @RequirePermissions('domain.update')
  @ApiOperation({ summary: 'Trigger a batch health check across all due domains (Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async runBatch(@Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number) {
    return this.healthCheckService.checkAllDueDomains(limit);
  }
}
