import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { BRAND } from '@finallinks/config';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  html: string;
  text: string;
}

export interface ApprovedCredentialsMailOptions {
  to: string;
  applicantName: string;
  websiteName: string;
  tempPassword: string;
  loginUrl: string;
  inviteUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly prisma: PrismaService) {
    this.fromAddress =
      process.env.MAIL_FROM || `${BRAND.fromName} <noreply@${BRAND.domain || 'finallinks.com'}>`;

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

      // Record to audit log without leaking any sensitive credentials
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

  /**
   * Common branded email shell wrapper
   */
  private renderEmailShell(contentHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0F172A; padding: 24px 32px; border-bottom: 2px solid #0B9DF7;">
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Final<span style="color: #0B9DF7;">Links</span>
                    </span>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 32px;">
                    ${contentHtml}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
                    <p style="margin: 0 0 4px 0;"><strong>${BRAND.name}</strong> &bull; ${BRAND.tagline}</p>
                    <p style="margin: 0;">If you have any questions, reach out at <a href="mailto:${BRAND.supportEmail || 'support@finallinks.com'}" style="color: #0B9DF7; text-decoration: none;">${BRAND.supportEmail || 'support@finallinks.com'}</a>.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendRegistrationConfirmationEmail(
    to: string,
    applicantName: string,
    websiteName: string,
    referenceId: string,
    verificationMethod: string,
    verificationToken: string,
  ) {
    const webUrl = process.env.WEB_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const statusUrl = `${webUrl}/requests/status?ref=${referenceId}&email=${encodeURIComponent(to)}`;
    const subject = `Application Received: ${websiteName} (${referenceId})`;
    const text = `Hello ${applicantName},\n\nWe have received your website registration request for "${websiteName}".\n\nReference ID: ${referenceId}\nVerification Method: ${verificationMethod}\nVerification Token: ${verificationToken}\n\nYou can track the status of your application here:\n${statusUrl}\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Application Received</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for submitting <strong>"${websiteName}"</strong> to ${BRAND.name}. Our moderation team has received your registration request.</p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Reference ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #0B9DF7; font-weight: 700;">${referenceId}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estimated Review:</strong> 1–2 business days</p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Verification Method:</strong> ${verificationMethod}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Verification Token:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${verificationToken}</code></p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${statusUrl}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Track Application Status</a>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_CONFIRMATION',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendRegistrationApprovedWithCredentialsEmail(options: ApprovedCredentialsMailOptions) {
    const { to, applicantName, websiteName, tempPassword, loginUrl, inviteUrl } = options;
    const subject = `Welcome to ${BRAND.name}! Your website "${websiteName}" is approved`;

    const text = `Hello ${applicantName},\n\nCongratulations! Your registration for "${websiteName}" on ${BRAND.name} has been approved.\n\nYour account credentials:\nLogin Email: ${to}\nTemporary Password: ${tempPassword}\n\nLogin to the Panel:\n${loginUrl}\n\nImportant Security Notice:\n- Your temporary password is valid for 72 hours.\n- You will be required to choose a new permanent password immediately upon your first login.\n\nAlternatively, you can activate your account and choose your password directly using this single-use setup link:\n${inviteUrl || loginUrl}\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Registration Approved & Welcome!</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations! Your registration for <strong>"${websiteName}"</strong> has been approved and listed on ${BRAND.name}.</p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 0 0 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #166534;"><strong>Your Account Credentials:</strong></p>
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #1e293b;"><strong>Email:</strong> <span style="font-family: monospace;">${to}</span></p>
        <p style="margin: 0; font-size: 13px; color: #1e293b;"><strong>Temporary Password:</strong> <code style="background: #dcfce7; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 15px; font-weight: 700; color: #15803d;">${tempPassword}</code></p>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin: 0 0 24px 0; font-size: 13px; color: #92400e; line-height: 1.5;">
        <strong>Security Notice:</strong> This temporary password expires in <strong>72 hours</strong>. Upon signing in, you will be automatically prompted to choose a permanent password.
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${loginUrl}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Log In to Panel</a>
      </div>

      ${
        inviteUrl
          ? `<p style="font-size: 12px; color: #64748b; text-align: center; margin: 16px 0 0 0;">
              Or set your permanent password directly via single-use link:<br/>
              <a href="${inviteUrl}" style="color: #0B9DF7; word-break: break-all;">${inviteUrl}</a>
            </p>`
          : ''
      }
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_APPROVED_CREDENTIALS',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendInviteEmail(to: string, applicantName: string, websiteName: string, inviteUrl: string) {
    const subject = `Welcome to ${BRAND.name}! Set up your account for ${websiteName}`;
    const text = `Hello ${applicantName},\n\nCongratulations! Your website "${websiteName}" has been approved on ${BRAND.name}.\n\nPlease activate your account and choose your password using this secure link:\n${inviteUrl}\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Welcome to ${BRAND.name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations! Your registration for <strong>"${websiteName}"</strong> has been approved.</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">Please click the button below to set up your password and access your owner dashboard:</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${inviteUrl}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Set Up Password</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        If the button does not work, copy and paste this link:<br/>
        <a href="${inviteUrl}" style="color: #0B9DF7; word-break: break-all;">${inviteUrl}</a>
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_APPROVED_INVITE',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendRejectionEmail(to: string, applicantName: string, websiteName: string, reason: string) {
    const subject = `${BRAND.name} Application Update: ${websiteName}`;
    const text = `Hello ${applicantName},\n\nThank you for applying to list "${websiteName}" on ${BRAND.name}.\n\nAfter review, we are unable to approve your application at this time.\nReason:\n${reason}\n\nIf you have questions, please reach out to our team.\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Application Update</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for your interest in listing <strong>"${websiteName}"</strong> on ${BRAND.name}.</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">After careful review by our curation team, your application was not approved for the following reason:</p>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; margin: 0 0 24px 0; color: #991b1b; font-size: 14px; line-height: 1.5; border-radius: 4px;">
        ${reason}
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0;">You are welcome to submit an updated application once the highlighted issues have been resolved.</p>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_REJECTED',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendChangesRequestedEmail(
    to: string,
    applicantName: string,
    websiteName: string,
    note: string,
    editUrl: string,
  ) {
    const subject = `Action Required: Updates requested for "${websiteName}" on ${BRAND.name}`;
    const text = `Hello ${applicantName},\n\nOur curation team reviewed your application for "${websiteName}" and requested some updates before approval.\n\nReviewer Note:\n${note}\n\nPlease update your application here:\n${editUrl}\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Action Required on Your Application</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${applicantName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Our review team reviewed your submission for <strong>"${websiteName}"</strong> and requested a few updates before we can approve it:</p>

      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 0 0 24px 0; color: #92400e; font-size: 14px; line-height: 1.5; border-radius: 4px;">
        ${note}
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${editUrl}" style="background-color: #F59E0B; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Update Application</a>
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'REGISTRATION_CHANGES_REQUESTED',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const subject = `Reset your ${BRAND.name} password`;
    const text = `Hello ${name},\n\nA password reset request was initiated for your ${BRAND.name} account.\n\nReset your password here (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, please disregard this email.\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Password Reset Request</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">A password reset request was initiated for your ${BRAND.name} account. Click below to choose a new password:</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Reset Password</a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'PASSWORD_RESET',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendPasswordChangedEmail(to: string, name: string) {
    const subject = `Security Notice: Your ${BRAND.name} password has been changed`;
    const text = `Hello ${name},\n\nThis is a confirmation that your password for ${BRAND.name} was successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe ${BRAND.name} Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Password Changed Successfully</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">This email confirms that the password for your ${BRAND.name} account has been updated.</p>
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px; font-size: 13px; color: #475569; margin: 0 0 20px 0;">
        If you did not perform this change, please contact <a href="mailto:${BRAND.supportEmail || 'support@finallinks.com'}" style="color: #0B9DF7;">${BRAND.supportEmail || 'support@finallinks.com'}</a> immediately to secure your account.
      </div>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'PASSWORD_CHANGED',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }

  async sendSupportReplyEmail(
    to: string,
    ticketId: string,
    subjectTitle: string,
    replyBody: string,
  ) {
    const subject = `[FL-${ticketId.slice(0, 8).toUpperCase()}] ${subjectTitle}`;
    const text = `Hello,\n\nOur support team has replied to your inquiry:\n\n${replyBody}\n\nReference: [FL-${ticketId.slice(0, 8).toUpperCase()}]\n\nBest regards,\nThe ${BRAND.name} Support Team`;

    const contentHtml = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Support Update</h2>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello,</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Our moderation and support team has responded to your report / query <strong>[FL-${ticketId.slice(0, 8).toUpperCase()}]</strong>:</p>

      <div style="background-color: #f8fafc; border-left: 4px solid #0B9DF7; padding: 14px 16px; margin: 0 0 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6; border-radius: 4px; white-space: pre-wrap;">
        ${replyBody}
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">If you have further questions, simply reply directly to this email or reach us at <a href="mailto:${BRAND.supportEmail || 'support@finallinks.com'}" style="color: #0B9DF7;">${BRAND.supportEmail || 'support@finallinks.com'}</a>.</p>
    `;

    return this.sendMail({
      to,
      subject,
      template: 'SUPPORT_REPLY',
      text,
      html: this.renderEmailShell(contentHtml),
    });
  }
}
