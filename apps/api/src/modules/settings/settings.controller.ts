import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public site configuration & feature toggles' })
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get all platform settings (Admin)' })
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Update platform settings (Admin)' })
  async updateSettings(@Body() body: Record<string, unknown>) {
    return this.settingsService.updateSettings(body);
  }
}
