import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WebsitesService } from './websites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  WebsiteFilterParams,
  UpdateWebsiteSchema,
  UpdateWebsiteInput,
  WebsiteStatus,
} from '@findfunlinks/contracts';

@ApiTags('Websites')
@Controller('websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  // ---------------------------------------------------------------------------
  // Public Endpoints
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Search and filter active websites with pagination (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categorySlug', required: false, type: String })
  @ApiQuery({ name: 'tagSlug', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['popular', 'newest', 'alphabetical'] })
  async findAllPublic(@Query() query: WebsiteFilterParams) {
    return this.websitesService.findAllPublic(query);
  }

  @Get('grouped')
  @ApiOperation({ summary: 'Get active websites grouped by category with active domains (Public)' })
  async findGroupedByCategory() {
    return this.websitesService.findGroupedByCategory();
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get full public details of a website by slug with working mirrors' })
  async findBySlugPublic(@Param('slug') slug: string) {
    return this.websitesService.findBySlugPublic(slug);
  }

  // ---------------------------------------------------------------------------
  // Website Owner Endpoints
  // ---------------------------------------------------------------------------

  @Get('my-website')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.view')
  @ApiOperation({ summary: "Get the authenticated owner's single website details" })
  async getMyWebsite(@CurrentUser('id') ownerId: string) {
    return this.websitesService.getMyWebsite(ownerId);
  }

  @Put('my-website')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.update')
  @ApiOperation({ summary: "Update the authenticated owner's website profile" })
  async updateMyWebsite(@CurrentUser('id') ownerId: string, @Body() body: UpdateWebsiteInput) {
    const validated = UpdateWebsiteSchema.parse(body);
    return this.websitesService.updateMyWebsite(ownerId, validated);
  }

  // ---------------------------------------------------------------------------
  // Super Admin Endpoints
  // ---------------------------------------------------------------------------

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.view')
  @ApiOperation({ summary: 'List all websites across all statuses (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: WebsiteStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: WebsiteStatus,
    @Query('search') search?: string,
  ) {
    return this.websitesService.findAllAdmin(page, limit, status, search);
  }

  @Put('admin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.update')
  @ApiOperation({ summary: 'Update any website details as Super Admin' })
  async updateAdmin(@Param('id') id: string, @Body() body: UpdateWebsiteInput) {
    const validated = UpdateWebsiteSchema.parse(body);
    return this.websitesService.updateAdmin(id, validated);
  }

  @Put('admin/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.update')
  @ApiOperation({ summary: 'Update website status (Active, Suspended, Archived)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: WebsiteStatus) {
    return this.websitesService.updateStatus(id, status);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.delete')
  @ApiOperation({ summary: 'Soft delete a website (Admin)' })
  async delete(@Param('id') id: string) {
    return this.websitesService.delete(id);
  }
}
