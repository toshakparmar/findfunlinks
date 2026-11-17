import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService, UserContext } from './domains.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDomainSchema,
  CreateDomainInput,
  BulkCreateDomainSchema,
  BulkCreateDomainInput,
  UpdateDomainSchema,
  UpdateDomainInput,
  ReorderDomainsSchema,
  ReorderDomainsInput,
} from '@findfunlinks/contracts';

@ApiTags('Domains')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // ---------------------------------------------------------------------------
  // Public Endpoints
  // ---------------------------------------------------------------------------

  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track outbound click for a mirror link (Public)' })
  async trackClick(@Param('id') id: string) {
    return this.domainsService.trackClick(id);
  }

  // ---------------------------------------------------------------------------
  // Website Owner / Super Admin Endpoints
  // ---------------------------------------------------------------------------

  @Get('website/:websiteId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.view')
  @ApiOperation({ summary: 'List all domains and mirrors for a website (Owner / Admin)' })
  async findAllByWebsite(@Param('websiteId') websiteId: string, @CurrentUser() user: UserContext) {
    return this.domainsService.findAllByWebsite(websiteId, user);
  }

  @Post('website/:websiteId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.create')
  @ApiOperation({ summary: 'Add a new mirror/domain to a website (Owner / Admin)' })
  async create(
    @Param('websiteId') websiteId: string,
    @Body() body: CreateDomainInput,
    @CurrentUser() user: UserContext,
  ) {
    const validated = CreateDomainSchema.parse(body);
    return this.domainsService.create(websiteId, validated, user);
  }

  @Post('website/:websiteId/bulk')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.create')
  @ApiOperation({ summary: 'Bulk-add mirrors/domains to a website with parsing (Owner / Admin)' })
  async createBulk(
    @Param('websiteId') websiteId: string,
    @Body() body: BulkCreateDomainInput,
    @CurrentUser() user: UserContext,
  ) {
    const validated = BulkCreateDomainSchema.parse(body);
    return this.domainsService.createBulk(websiteId, validated, user);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.update')
  @ApiOperation({ summary: 'Update an existing domain or mirror (Owner / Admin)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateDomainInput,
    @CurrentUser() user: UserContext,
  ) {
    const validated = UpdateDomainSchema.parse(body);
    return this.domainsService.update(id, validated, user);
  }

  @Put('website/:websiteId/reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.update')
  @ApiOperation({ summary: 'Reorder domains display priority for a website (Owner / Admin)' })
  async reorder(
    @Param('websiteId') websiteId: string,
    @Body() body: ReorderDomainsInput,
    @CurrentUser() user: UserContext,
  ) {
    const validated = ReorderDomainsSchema.parse(body);
    return this.domainsService.reorder(websiteId, validated, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('domain.delete')
  @ApiOperation({ summary: 'Delete a domain or mirror (Owner / Admin)' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.domainsService.delete(id, user);
  }
}
