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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RegistrationSubmitSchema,
  RegistrationSubmitInput,
  RegistrationStatus,
  ReviewRegistrationSchema,
  ReviewRegistrationInput,
  ResubmitRegistrationSchema,
  ResubmitRegistrationInput,
} from '@findfunlinks/contracts';
import { Request } from 'express';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // ---------------------------------------------------------------------------
  // Public Endpoints
  // ---------------------------------------------------------------------------

  @Post()
  @ApiOperation({ summary: 'Submit a new website registration request (Public)' })
  async submit(@Body() body: RegistrationSubmitInput, @Req() req: Request) {
    const validated = RegistrationSubmitSchema.parse(body);
    return this.registrationsService.submitRegistration(validated, req);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check status of a registration request by Reference ID & Email (Public)' })
  @ApiQuery({ name: 'ref', required: true, type: String })
  @ApiQuery({ name: 'email', required: true, type: String })
  async getStatus(@Query('ref') ref?: string, @Query('email') email?: string) {
    if (!ref || !email) {
      throw new BadRequestException('Both Reference ID ("ref") and Email ("email") are required.');
    }
    return this.registrationsService.getStatus(ref, email);
  }

  @Post('resubmit')
  @ApiOperation({ summary: 'Resubmit modified registration info after CHANGES_REQUESTED (Public)' })
  async resubmit(@Body() body: ResubmitRegistrationInput, @Req() req: Request) {
    const validated = ResubmitRegistrationSchema.parse(body);
    return this.registrationsService.resubmit(validated, req);
  }

  @Get('edit/:token')
  @ApiOperation({
    summary: 'Retrieve registration details for modification (Public via single-use token)',
  })
  async getForEdit(@Param('token') token: string) {
    return this.registrationsService.getRegistrationForEdit(token);
  }

  @Put('edit/:token')
  @ApiOperation({
    summary: 'Submit modifications and resubmit application (Public via single-use token)',
  })
  async updateWithToken(
    @Param('token') token: string,
    @Body() body: Partial<RegistrationSubmitInput>,
  ) {
    return this.registrationsService.updateRegistrationWithToken(token, body);
  }

  // ---------------------------------------------------------------------------
  // Admin Endpoints
  // ---------------------------------------------------------------------------

  @Get('pending-count')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.view')
  @ApiOperation({ summary: 'Get total pending registrations count (Admin)' })
  async getPendingCount() {
    return this.registrationsService.getPendingCount();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.view')
  @ApiOperation({ summary: 'List registration requests with filtering & pagination (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: RegistrationStatus,
    @Query('search') search?: string,
  ) {
    return this.registrationsService.findAllAdmin(page, limit, status, search);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.view')
  @ApiOperation({ summary: 'Get details of a registration request (Admin)' })
  async findOneAdmin(@Param('id') id: string) {
    return this.registrationsService.findOneAdmin(id);
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.approve')
  @ApiOperation({
    summary:
      'Approve application: creates Owner account, Website, initial Domains, and emails invite link (Admin)',
  })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Req() req: Request,
  ) {
    return this.registrationsService.approve(id, reviewerId, req);
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.reject')
  @ApiOperation({ summary: 'Reject application with reason and email applicant (Admin)' })
  async reject(
    @Param('id') id: string,
    @Body() body: ReviewRegistrationInput,
    @CurrentUser('id') reviewerId: string,
    @Req() req: Request,
  ) {
    const validated = ReviewRegistrationSchema.parse(body);
    return this.registrationsService.reject(id, reviewerId, validated, req);
  }

  @Post(':id/request-changes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('registration.review')
  @ApiOperation({ summary: 'Request changes with note and email applicant an edit link (Admin)' })
  async requestChanges(
    @Param('id') id: string,
    @Body() body: ReviewRegistrationInput,
    @CurrentUser('id') reviewerId: string,
    @Req() req: Request,
  ) {
    const validated = ReviewRegistrationSchema.parse(body);
    return this.registrationsService.requestChanges(id, reviewerId, validated, req);
  }
}
