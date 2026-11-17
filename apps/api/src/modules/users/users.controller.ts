import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { UserStatus } from '@prisma/client';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('user.view')
  @ApiOperation({ summary: 'List all users with pagination and search' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20, search);
  }

  @Get(':id')
  @RequirePermissions('user.view')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermissions('user.suspend')
  @ApiOperation({ summary: 'Update user status (ACTIVE, SUSPENDED)' })
  async setStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: UserStatus) {
    return this.usersService.setStatus(id, status);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  @ApiOperation({ summary: 'Soft delete user account' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
