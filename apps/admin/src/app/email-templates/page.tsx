'use client';

import React, { useState } from 'react';
import {
  Eye,
  Send,
  Save,
  X,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { BRAND } from '@finallinks/config';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  description: string;
  variables: string[];
  restrictedVariables?: string[];
  html: string;
  text: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'REGISTRATION_APPROVED',
    name: 'Registration Approved & Credentials',
    category: 'Onboarding',
    subject: `Your {{websiteName}} is approved on ${BRAND.name}`,
    description: 'Dispatched to website owners when an operator approves their directory registration. Contains temporary password.',
    variables: ['applicantName', 'brandName', 'websiteName', 'loginUrl', 'email', 'tempPassword', 'expiresIn', 'supportEmail'],
    restrictedVariables: ['tempPassword'],
    html: `
<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Your Website is Approved!</h2>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>{{applicantName}}</strong>,</p>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Great news! Your website <strong>"{{websiteName}}"</strong> has been approved and is now live on <strong>{{brandName}}</strong>.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 0 0 24px 0;">
  <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b;">Your Owner Credentials</p>
  <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Login Email:</strong> <code style="color: #0B9DF7;">{{email}}</code></p>
  <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="color: #10B981; font-weight: 700;">{{tempPassword}}</code></p>
  <p style="margin: 0; font-size: 12px; color: #f59e0b; font-weight: 600;">(Expires in {{expiresIn}}. You must set a permanent password upon first login.)</p>
</div>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{loginUrl}}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Access Owner Console</a>
</div>
    `.trim(),
    text: `Hello {{applicantName}},\n\nYour website "{{websiteName}}" has been approved on {{brandName}}.\n\nCredentials:\nEmail: {{email}}\nTemporary Password: {{tempPassword}} (Expires in {{expiresIn}})\n\nLogin here: {{loginUrl}}\n\nBest regards,\nThe {{brandName}} Team`,
  },
  {
    id: 'REGISTRATION_REJECTED',
    name: 'Registration Rejected',
    category: 'Moderation',
    subject: `Application update regarding "{{websiteName}}" on ${BRAND.name}`,
    description: 'Sent when an application is rejected with a respectful reason, reference ID, and reapply guidelines.',
    variables: ['applicantName', 'brandName', 'websiteName', 'reason', 'referenceId', 'reapplyUrl', 'supportEmail'],
    html: `
<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Application Status Update</h2>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>{{applicantName}}</strong>,</p>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for your interest in listing <strong>"{{websiteName}}"</strong> on {{brandName}} (Ref: <code>{{referenceId}}</code>). After careful review, we are unable to accept your submission at this time:</p>
<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; margin: 0 0 24px 0; color: #991b1b; font-size: 14px; line-height: 1.5; border-radius: 4px;">
  {{reason}}
</div>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">You are welcome to resolve these issues and re-apply at any time via the directory portal.</p>
    `.trim(),
    text: `Hello {{applicantName}},\n\nRegarding your submission for "{{websiteName}}" (Ref: {{referenceId}}):\n\nReason for rejection:\n{{reason}}\n\nYou can reapply here: {{reapplyUrl}}\n\nBest regards,\nThe {{brandName}} Team`,
  },
  {
    id: 'QUERY_REPLY',
    name: 'Query & Report Support Reply',
    category: 'Support',
    subject: `[{{ticketId}}] Update regarding your report`,
    description: 'Official response dispatched from the inbox desk to user inquiries and broken link reporters.',
    variables: ['ticketId', 'reason', 'replyMessage', 'brandName', 'supportEmail'],
    html: `
<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Support Update</h2>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello,</p>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Our moderation and support team has responded to your report <strong>[{{ticketId}}]</strong>:</p>
<div style="background-color: #f8fafc; border-left: 4px solid #0B9DF7; padding: 14px 16px; margin: 0 0 24px 0; color: #1e293b; font-size: 14px; line-height: 1.6; border-radius: 4px;">
  {{replyMessage}}
</div>
<p style="font-size: 12px; color: #64748b; line-height: 1.5;">If you have further questions, simply reply directly to this email or reach us at <a href="mailto:{{supportEmail}}" style="color: #0B9DF7;">{{supportEmail}}</a>.</p>
    `.trim(),
    text: `Hello,\n\nOur support team has responded to [{{ticketId}}]:\n\n{{replyMessage}}\n\nBest regards,\nThe {{brandName}} Support Team`,
  },
  {
    id: 'PASSWORD_RESET',
    name: 'Password Reset Request',
    category: 'Security',
    subject: `Reset your ${BRAND.name} password`,
    description: 'Automated 1-hour secure password reset link for platform operators and website owners.',
    variables: ['name', 'brandName', 'resetUrl', 'supportEmail'],
    html: `
<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0F172A;">Password Reset Request</h2>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>{{name}}</strong>,</p>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">A password reset request was initiated for your {{brandName}} account. Click below to establish a new password:</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{resetUrl}}" style="background-color: #0B9DF7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Reset Password</a>
</div>
<p style="font-size: 12px; color: #64748b; line-height: 1.5;">This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
    `.trim(),
    text: `Hello {{name}},\n\nA password reset request was initiated for your {{brandName}} account.\n\nReset your password here (valid for 1 hour):\n{{resetUrl}}\n\nBest regards,\nThe {{brandName}} Team`,
  },
  {
    id: 'DOMAIN_DOWN_ALERT',
    name: 'Mirror Offline Alert',
    category: 'Monitoring',
    subject: `Alert: Mirror offline for "{{websiteName}}" on ${BRAND.name}`,
    description: 'Instant notification dispatched to owners when consecutive automated health-checks fail.',
    variables: ['ownerName', 'websiteName', 'hostname', 'brandName', 'manageUrl'],
    html: `
<h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #DC2626;">Mirror Unreachable Notice</h2>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>{{ownerName}}</strong>,</p>
<p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Our automated DNS health-check system detected that mirror <code>{{hostname}}</code> for <strong>"{{websiteName}}"</strong> has failed multiple consecutive latency checks and is currently unreachable.</p>
<div style="text-align: center; margin: 28px 0;">
  <a href="{{manageUrl}}" style="background-color: #DC2626; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Manage Mirrors & Domains</a>
</div>
    `.trim(),
    text: `Hello {{ownerName}},\n\nMirror {{hostname}} for "{{websiteName}}" is currently unreachable.\n\nPlease check your server or update your mirrors at: {{manageUrl}}\n\nBest regards,\nThe {{brandName}} Health Monitoring System`,
  },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(DEFAULT_TEMPLATES[0]!);
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES[0]!.subject);
  const [htmlContent, setHtmlContent] = useState(DEFAULT_TEMPLATES[0]!.html);
  const [textContent, setTextContent] = useState(DEFAULT_TEMPLATES[0]!.text);
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('operator@finallinks.com');
  const [sendingTest, setSendingTest] = useState(false);

  const handleSelectTemplate = (t: EmailTemplate) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setHtmlContent(t.html);
    setTextContent(t.text);
  };

  const handleInsertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    if (activeTab === 'html') {
      setHtmlContent((prev) => prev + placeholder);
    } else {
      setTextContent((prev) => prev + placeholder);
    }
    toast.success(`Inserted ${placeholder}`);
  };

  const handleSaveTemplate = () => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, subject, html: htmlContent, text: textContent }
          : t,
      ),
    );
    toast.success(`Template "${selectedTemplate.name}" saved!`);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSendingTest(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(`Test email for "${selectedTemplate.name}" dispatched to ${testEmailRecipient}`);
      setTestEmailOpen(false);
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  // Render mock preview
  const getRenderedPreview = () => {
    let rendered = htmlContent;
    const mockData: Record<string, string> = {
      applicantName: 'Alex Mercer',
      name: 'Alex Mercer',
      ownerName: 'Alex Mercer',
      websiteName: 'AniWave Stream',
      brandName: BRAND.name,
      loginUrl: 'http://localhost:3001/login',
      email: 'alex@aniwave.to',
      tempPassword: 'FL-9xK$2mP#8vQ',
      expiresIn: '72 hours',
      supportEmail: BRAND.supportEmail || 'support@finallinks.com',
      reason: 'The primary domain failed our automated DNS certificate inspection.',
      referenceId: 'FL-REG-84920',
      reapplyUrl: 'http://localhost:3000/register',
      ticketId: 'FL-TK-10492',
      replyMessage: 'We have verified your updated mirrors and restored public discovery status.',
      resetUrl: 'http://localhost:3001/accept-invite?token=demo-token',
      hostname: 'mirror2.aniwave.to',
      manageUrl: 'http://localhost:3001/my-websites/domains',
    };

    Object.entries(mockData).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`{{${k}}}`, 'g'), v);
    });

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 24px; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #0F172A; padding: 24px 32px; border-bottom: 3px solid #0B9DF7;">
            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${BRAND.name}</h1>
          </div>
          <div style="padding: 32px;">
            ${rendered}
          </div>
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 32px; font-size: 12px; color: #64748b; text-align: center;">
            <p style="margin: 0 0 4px 0;">This is an automated notification from ${BRAND.name}.</p>
            <p style="margin: 0;">For inquiries, contact <a href="mailto:${BRAND.supportEmail || 'support@finallinks.com'}" style="color: #0B9DF7;">${BRAND.supportEmail || 'support@finallinks.com'}</a>.</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Transactional Email Templates
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Configure system notification templates, variable interpolations, and live test delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <Eye className="h-4 w-4 text-[#0B9DF7]" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setTestEmailOpen(true)}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors"
          >
            <Send className="h-4 w-4 text-emerald-400" />
            <span>Send Test</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTemplate}
            className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Template List + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates Sidebar (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-[#33373D] bg-[#1E2024] p-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] px-2 block mb-3">
            Template Store ({templates.length})
          </span>

          <div className="space-y-1.5">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplate.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border ${
                    isSelected
                      ? 'bg-[#26292F] border-[#0B9DF7] text-white'
                      : 'border-transparent text-[#D1D5DB] hover:bg-[#26292F]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{tpl.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16181B] text-[#9CA3AF] border border-[#33373D]">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Editor (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F4F6]">{selectedTemplate.name}</h2>
              <span className="text-xs font-mono text-[#0B9DF7]">{selectedTemplate.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-3.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'html'
                    ? 'bg-[#0B9DF7] text-white'
                    : 'border border-[#33373D] text-[#9CA3AF] hover:text-white'
                }`}
              >
                HTML Template
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-[#0B9DF7] text-white'
                    : 'border border-[#33373D] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Plain Text
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
            />
          </div>

          {/* Variable Chips Inserter */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#0B9DF7]" />
              <span>Available Dynamic Placeholders (Click to insert)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplate.variables.map((v) => {
                const isRestricted = selectedTemplate.restrictedVariables?.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
                      isRestricted
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-[#16181B] border-[#33373D] text-[#D1D5DB] hover:border-[#0B9DF7]'
                    }`}
                  >
                    {`{{${v}}}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body Editor */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
              {activeTab === 'html' ? 'Email Body HTML' : 'Plain Text Fallback'}
            </label>
            {activeTab === 'html' ? (
              <textarea
                rows={14}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full rounded-lg border border-[#33373D] bg-[#16181B] p-3.5 font-mono text-xs text-[#D1D5DB] leading-relaxed focus:outline-none focus:border-[#0B9DF7]"
              />
            ) : (
              <textarea
                rows={14}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full rounded-lg border border-[#33373D] bg-[#16181B] p-3.5 font-mono text-xs text-[#D1D5DB] leading-relaxed focus:outline-none focus:border-[#0B9DF7]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#F3F4F6]">Live Email Preview</h2>
                <p className="text-xs text-[#9CA3AF]">
                  Subject: <strong className="text-[#F3F4F6]">{subject}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="rounded-xl overflow-hidden border border-[#33373D]"
              dangerouslySetInnerHTML={{ __html: getRenderedPreview() }}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 h-11 rounded-lg bg-[#26292F] text-sm font-medium text-white hover:bg-[#33373D]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {testEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-[#33373D] bg-[#1E2024] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <h2 className="text-base font-bold text-[#F3F4F6]">Send Test Email</h2>
              <button
                type="button"
                onClick={() => setTestEmailOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs text-[#9CA3AF]">
                Dispatches a rendered test sample of <strong>&quot;{selectedTemplate.name}&quot;</strong> via the transactional mail service.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#33373D]">
              <button
                type="button"
                onClick={() => setTestEmailOpen(false)}
                className="px-4 h-11 rounded-lg border border-[#33373D] bg-[#16181B] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTestEmail}
                className="px-5 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {sendingTest && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
