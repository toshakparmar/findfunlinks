import {
  Controller,
  Get,
  Post,
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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateCategorySchema,
  CreateCategoryInput,
  UpdateCategorySchema,
  UpdateCategoryInput,
} from '@findfunlinks/contracts';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ---------------------------------------------------------------------------
  // Public Endpoints
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'List all active categories with website counts (Public)' })
  async findAllPublic() {
    return this.categoriesService.findAllPublic();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category details and paginated websites by slug (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.categoriesService.findBySlug(slug, page, limit);
  }

  // ---------------------------------------------------------------------------
  // Admin Endpoints
  // ---------------------------------------------------------------------------

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.view')
  @ApiOperation({ summary: 'List all categories with internal stats (Admin)' })
  async findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.create')
  @ApiOperation({ summary: 'Create a new category (Admin)' })
  async create(@Body() body: CreateCategoryInput) {
    const validated = CreateCategorySchema.parse(body);
    return this.categoriesService.create(validated);
  }

  @Put('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.update')
  @ApiOperation({ summary: 'Reorder categories (Admin)' })
  async reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.categoriesService.reorder(body.items);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.update')
  @ApiOperation({ summary: 'Update an existing category (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateCategoryInput) {
    const validated = UpdateCategorySchema.parse(body);
    return this.categoriesService.update(id, validated);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.delete')
  @ApiOperation({ summary: 'Delete a category if empty (Admin)' })
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
