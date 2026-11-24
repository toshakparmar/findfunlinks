import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WebsitesService, CreateWebsiteAdminInput } from './websites.service';
import { VoterIdentityService } from './voter-identity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  WebsiteFilterParams,
  UpdateWebsiteSchema,
  UpdateWebsiteInput,
  WebsiteStatus,
} from '@finallinks/contracts';

@ApiTags('Websites')
@Controller(['websites', 'public/websites'])
export class WebsitesController {
  constructor(
    private readonly websitesService: WebsitesService,
    private readonly voterIdentityService: VoterIdentityService,
  ) {}

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

  @Get(':slug/preview')
  @ApiOperation({ summary: 'Get preview data for inline expandable dropdown (Public)' })
  async getPreviewBySlug(@Param('slug') slug: string) {
    return this.websitesService.getPreviewBySlug(slug);
  }

  @Get(':slug/detail')
  @ApiOperation({ summary: 'Get full detail data for website detail page (Public)' })
  async getDetailBySlug(@Param('slug') slug: string) {
    return this.websitesService.getDetailBySlug(slug);
  }

  @Get(':slug/engagement')
  @ApiOperation({ summary: 'Get visitor-specific engagement/star status (Public)' })
  async getEngagement(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { voterHash } = this.voterIdentityService.getOrCreateVoterIdentity(req, res);
    return this.websitesService.getEngagement(slug, voterHash);
  }

  @Put(':slug/star')
  @ApiOperation({ summary: 'Idempotently give a star to a website (Public / Visitors)' })
  async putStar(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { voterHash, ipHash } = this.voterIdentityService.getOrCreateVoterIdentity(req, res);
    const ownerUserId = (req as any).user?.id;
    return this.websitesService.toggleStar(slug, voterHash, ipHash, true, ownerUserId);
  }

  @Delete(':slug/star')
  @ApiOperation({ summary: 'Remove a star from a website (Public / Visitors)' })
  async deleteStar(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { voterHash, ipHash } = this.voterIdentityService.getOrCreateVoterIdentity(req, res);
    return this.websitesService.toggleStar(slug, voterHash, ipHash, false);
  }

  @Post(':id/star')
  @ApiOperation({ summary: 'Add a star to website (Public / Visitors legacy)' })
  async addStar(@Param('id') id: string) {
    return this.websitesService.addStar(id);
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

  @Get('my-website/analytics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.view')
  @ApiOperation({ summary: "Get analytics overview for the authenticated owner's website" })
  async getMyWebsiteAnalytics(@CurrentUser('id') ownerId: string, @Query('range') range?: string) {
    return this.websitesService.getMyWebsiteAnalytics(ownerId, range);
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
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: WebsiteStatus,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.websitesService.findAllAdmin(page, limit, status, search, categoryId);
  }

  @Post('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.create')
  @ApiOperation({ summary: 'Register a new website as Super Admin' })
  async createAdmin(@Body() body: CreateWebsiteAdminInput) {
    return this.websitesService.createAdmin(body);
  }

  @Put('admin/categories/:categoryId/reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.update')
  @ApiOperation({ summary: 'Reorder websites within a category (Admin)' })
  async reorderCategoryWebsites(
    @Param('categoryId') categoryId: string,
    @Body('items') items: Array<{ id: string; sortOrder: number }>,
  ) {
    return this.websitesService.reorderCategoryWebsites(categoryId, items);
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

  @Put('admin/:id/stars')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('website.update')
  @ApiOperation({ summary: 'Update website stars (Admin)' })
  async updateStars(@Param('id') id: string, @Body('stars') stars: number) {
    return this.websitesService.updateStars(id, stars);
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
