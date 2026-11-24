import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateTagSchema,
  CreateTagInput,
  UpdateTagSchema,
  UpdateTagInput,
} from '@finallinks/contracts';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags with active website counts (Public)' })
  async findAllPublic() {
    return this.tagsService.findAllPublic();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.create')
  @ApiOperation({ summary: 'Create a new tag (Admin)' })
  async create(@Body() body: CreateTagInput) {
    const validated = CreateTagSchema.parse(body);
    return this.tagsService.create(validated);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.update')
  @ApiOperation({ summary: 'Update a tag (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateTagInput) {
    const validated = UpdateTagSchema.parse(body);
    return this.tagsService.update(id, validated);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('category.delete')
  @ApiOperation({ summary: 'Delete a tag (Admin)' })
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
