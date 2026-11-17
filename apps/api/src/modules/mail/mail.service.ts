import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly prisma: PrismaService) {
    this.fromAddress = process.env.MAIL_FROM || 'FindFunLinks <noreply@findfunlinks.com>';

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
      });
      this.logger.log(`Configured SMTP transport for ${process.env.SMTP_HOST}`);
    } else {
      this.logger.log(
        'No SMTP configuration found. MailService running in development simulation mode.',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      if (this.transporter && process.env.NODE_ENV === 'production') {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
      } else {
        this.logger.log(
          `[SIMULATED EMAIL DISPATCH] To: ${options.to} | Subject: "${options.subject}" | Template: ${options.template}`,
        );
      }

      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          template: options.template,
          status: 'SENT',
        },
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to dispatch email to ${options.to}: ${errorMessage}`);

      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          template: options.template,
          status: 'FAILED',
          error: errorMessage,
        },
      });

      return false;
    }
  }

  async sendInviteEmail(to: string, applicantName: string, websiteName: string, inviteUrl: string) {
    const subject = `Welcome to FindFunLinks! Set up your account for ${websiteName}`;
    const text = `Hello ${applicantName},\n\nCongratulations! Your website "${websiteName}" has been approved for FindFunLinks.\n\nPlease activate your Website Owner account and set your password using this secure single-use link (valid for 24 hours):\n${inviteUrl}\n\nOnce set up, you can log in to your Website Owner panel to add mirrors, manage domains, and review link health.\n\nBest regards,\nThe FindFunLinks Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0B57D9; margin-bottom: 16px;">Welcome to FindFunLinks!</h2>
        <p>Hello <strong>${applicantName}</strong>,</p>
        <p>Congratulations! Your registration for <strong>"${websiteName}"</strong> has been approved.</p>
        <p>Please click the button below to set up your password and activate your Website Owner account. This link expires in <strong>24 hours</strong> and can only be used once:</p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${inviteUrl}" style="background-color: #0B57D9; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Set Your Password</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If the button does not work, copy and paste this link into your browser:<br/><a href="${inviteUrl}">${inviteUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">FindFunLinks &bull; Live working mirrors & fun websites directory.</p>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_APPROVED_INVITE',
      text,
      html,
    });
  }

  async sendRejectionEmail(to: string, applicantName: string, websiteName: string, reason: string) {
    const subject = `FindFunLinks Application Update: ${websiteName}`;
    const text = `Hello ${applicantName},\n\nThank you for applying to list "${websiteName}" on FindFunLinks.\n\nAfter review, we are unable to approve your application at this time.\nReason:\n${reason}\n\nIf you have questions or believe this was in error, you may reply to this email or submit a corrected application.\n\nBest regards,\nThe FindFunLinks Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0B57D9; margin-bottom: 16px;">FindFunLinks Application Update</h2>
        <p>Hello <strong>${applicantName}</strong>,</p>
        <p>Thank you for your interest in listing <strong>"${websiteName}"</strong> on FindFunLinks.</p>
        <p>After careful review by our curation team, your application was not approved for the following reason:</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; color: #991b1b;">
          ${reason}
        </div>
        <p>You are welcome to submit an updated request once the noted concerns are addressed.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">FindFunLinks Directory</p>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_REJECTED',
      text,
      html,
    });
  }

  async sendChangesRequestedEmail(
    to: string,
    applicantName: string,
    websiteName: string,
    note: string,
    editUrl: string,
  ) {
    const subject = `Action Required: Changes requested for "${websiteName}" on FindFunLinks`;
    const text = `Hello ${applicantName},\n\nOur curation team reviewed your application for "${websiteName}" and requested some updates before we can proceed.\n\nReviewer Note:\n${note}\n\nPlease click the link below to update and resubmit your application:\n${editUrl}\n\nBest regards,\nThe FindFunLinks Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0B57D9; margin-bottom: 16px;">Action Required on Your Application</h2>
        <p>Hello <strong>${applicantName}</strong>,</p>
        <p>Our review team reviewed your submission for <strong>"${websiteName}"</strong> and requested a few updates:</p>
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; color: #92400e;">
          ${note}
        </div>
        <p>Please update your details using the link below to re-submit for approval:</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${editUrl}" style="background-color: #F59E0B; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Update Application</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">FindFunLinks Directory</p>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_CHANGES_REQUESTED',
      text,
      html,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const subject = 'Reset your FindFunLinks password';
    const text = `Hello ${name},\n\nA password reset request was initiated for your FindFunLinks account.\n\nClick the link below to set a new password (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, please disregard this email.\n\nBest regards,\nThe FindFunLinks Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0B57D9; margin-bottom: 16px;">Password Reset Request</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>A request was received to reset the password for your account.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #0B57D9; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'PASSWORD_RESET',
      text,
      html,
    });
  }
}
