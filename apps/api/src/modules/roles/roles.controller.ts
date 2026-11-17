import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Admin Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'List all roles with assigned permissions' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @RequirePermissions('role.view')
  @ApiOperation({ summary: 'List all system permissions grouped by module' })
  async getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Post()
  @RequirePermissions('role.create')
  @ApiOperation({ summary: 'Create a custom role' })
  async create(
    @Body('name') name: string,
    @Body('description') description: string | undefined,
    @Body('permissions') permissions: string[],
  ) {
    return this.rolesService.create(name, description, permissions || []);
  }

  @Put(':id/permissions')
  @RequirePermissions('role.update')
  @ApiOperation({ summary: 'Update permissions assigned to a role' })
  async updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('permissions') permissions: string[],
  ) {
    return this.rolesService.updatePermissions(id, permissions || []);
  }

  @Delete(':id')
  @RequirePermissions('role.delete')
  @ApiOperation({ summary: 'Delete a custom role' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.delete(id);
  }
}
