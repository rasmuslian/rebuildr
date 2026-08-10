import { Inject, Injectable } from '@nestjs/common';
import FormData from 'form-data';
import handlebars from 'handlebars';
import mjml from 'mjml';
import Mailgun, { Interfaces } from 'mailgun.js';
import * as fs from 'fs';
import { InternalServerException } from 'src/exceptions';
import { User } from 'src/entities/user.entity';
import { ReportPurchaseTypeEnum } from 'src/entities/report-purchase.entity';
import { ReportProductTypeEnum } from 'src/entities/report-product.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { S3Service } from './s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const verifyEmailTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/verify-email.mjml`,
  'utf8',
);
const resetPasswordTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/reset-password.mjml`,
  'utf8',
);
const reportPurchaseTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/report-purchase.mjml`,
  'utf8',
);
const reportProductTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/report-product.mjml`,
  'utf8',
);
const systemMessageTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/system-message.mjml`,
  'utf8',
);
const userMessageTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/user-message.mjml`,
  'utf8',
);
const accountExistsTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/account-exists.mjml`,
  'utf8',
);
const activatePayoutsTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/activate-payouts.mjml`,
  'utf8',
);
const businessRegistrationNotificationTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/business-registration-notification.mjml`,
  'utf8',
);
const businessApprovedTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/business-approved.mjml`,
  'utf8',
);
const welcomeIndividualTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/welcome-individual.mjml`,
  'utf8',
);
const organizationInviteTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/organization-invite.mjml`,
  'utf8',
);
const internalAdEventTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/internal-ad-event.mjml`,
  'utf8',
);

const MAILGUN_DOMAIN = 'rebuildr.se';

@Injectable()
export class MailService {
  private mailgun: Interfaces.IMailgunClient;
  private from: string;
  private baseUrl: string;
  private baseContext = {};

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private s3Service: S3Service,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const mailgun = new Mailgun(FormData);

    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: 'https://api.eu.mailgun.net',
    });
    this.baseUrl = process.env.WEB_BASE_URL;
    this.from = 'RebuildR <noreply@rebuildr.se>';
  }

  async onModuleInit() {
    try {
      const logo = await this.s3Service.getUrl('mail-logo.png');
      this.baseContext = {
        logo,
      };
    } catch (e) {
      this.logger.error('MailService setup: Failed getting mail-logo', e);
    }
  }

  async sendVerifyEmail(input: { email: string; token: string }) {
    const context = {
      ...this.baseContext,
      token: input.token,
      email: input.email,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(verifyEmailTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Email verification',
      text: 'verify',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendAccountExistsEmail(input: { email: string }) {
    const context = {
      ...this.baseContext,
      email: input.email,
      loginUrl: this.baseUrl,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(accountExistsTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Kontot finns redan',
      text: 'Det finns redan ett konto kopplat till denna e-postadress.',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendResetPasswordEmail(input: { email: string; token: string }) {
    const context = {
      ...this.baseContext,
      token: input.token,
      email: input.email,
      newPasswordUrl: `${this.baseUrl}/new-password?email=${encodeURIComponent(input.email)}&token=${input.token}`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(resetPasswordTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Reset password',
      text: 'Reset password',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendReportpurchaseEmail(
    input: {
      buyer: User;
      seller: User;
      product: { id: string; title: string };
      purchase: { id: string };
      report: { message: string; type: ReportPurchaseTypeEnum };
    },
    to?: string,
  ) {
    const context = {
      ...this.baseContext,
      productTitle: input.product.title,
      message: input.report.message,
      type: input.report.type,
      buyerEmail: input.buyer.email,
      sellerEmail: input.seller.email,
      productId: input.product.id,
      purchaseId: input.purchase.id,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(reportPurchaseTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: to ?? 'support@rebuildr.org',
      from: this.from,
      subject: 'Rapportering av köp',
      text: 'Rapportering av köp',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendReportProductEmail(
    input: {
      reporter: User;
      seller: User;
      product: { id: string; title: string };
      report: { message: string; type: ReportProductTypeEnum };
    },
    to?: string,
  ) {
    const context = {
      ...this.baseContext,
      productTitle: input.product.title,
      message: input.report.message,
      type: input.report.type,
      reporterEmail: input.reporter.email,
      sellerEmail: input.seller.email,
      productId: input.product.id,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(reportProductTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: to ?? 'support@rebuildr.org',
      from: this.from,
      subject: 'Rapportering av produkt',
      text: 'Rapportering av produkt',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendSystemMessageEmail(input: {
    product: { title: string };
    receiver: User;
  }) {
    const context = {
      ...this.baseContext,
      productTitle: input.product.title,
      loginUrl: `${process.env.WEB_BASE_URL}`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(systemMessageTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.receiver.email,
      from: this.from,
      subject: `Meddelande: ${input.product.title}`,
      text: `Meddelande: ${input.product.title}`,
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendUserMessageEmail(input: {
    productTitle: string;
    receiverEmail: string;
  }) {
    const context = {
      ...this.baseContext,
      productTitle: input.productTitle,
      loginUrl: `${process.env.WEB_BASE_URL}`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(userMessageTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.receiverEmail,
      from: this.from,
      subject: `Meddelande: ${input.productTitle}`,
      text: `Meddelande: ${input.productTitle}`,
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendActivatePayoutsEmail(input: { email: string }) {
    const context = {
      ...this.baseContext,
      payoutOnboardingUrl: `${this.baseUrl}/go/activate-payouts`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(activatePayoutsTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Aktivera utbetalningar — så får du betalt för dina annonser',
      text: 'Aktivera utbetalningar — så får du betalt för dina annonser',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendBusinessRegistrationNotification(input: {
    email: string;
    organizationNumber: string;
  }) {
    const context = {
      ...this.baseContext,
      businessEmail: input.email,
      organizationNumber: input.organizationNumber,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(businessRegistrationNotificationTemplate).html,
    );
    console.log('sending businessRegistrationMail');
    const html = handlebarsTemplate(context);
    const data = {
      to:
        process.env.NODE_ENV === 'development'
          ? input.email
          : 'support@rebuildr.org',
      from: this.from,
      subject: 'Nytt företagskonto väntar på godkännande',
      text: `Nytt företagskonto: ${input.email} (${input.organizationNumber})`,
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendWelcomeIndividualEmail(input: { email: string }) {
    const context = {
      ...this.baseContext,
      sellUrl: this.baseUrl,
      profileUrl: `${this.baseUrl}/account/profile`,
      payoutUrl: `${this.baseUrl}/go/activate-payouts`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(welcomeIndividualTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Välkommen till Rebuildr!',
      text: 'Välkommen till Rebuildr! Ditt konto är klart — så här kommer du igång.',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendBusinessApprovedEmail(input: { email: string }) {
    const context = {
      ...this.baseContext,
      loginUrl: this.baseUrl,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(businessApprovedTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: 'Ditt företagskonto är godkänt',
      text: 'Ditt företagskonto hos RebuildR är nu godkänt. Du kan nu logga in.',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendOrganizationInviteEmail(input: {
    email: string;
    organizationName: string;
    token: string;
  }) {
    const context = {
      ...this.baseContext,
      organizationName: input.organizationName,
      inviteUrl: `${this.baseUrl}/internal/invite?token=${input.token}`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(organizationInviteTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: `${input.organizationName} har bjudit in dig till Internlagret`,
      text: `${input.organizationName} har bjudit in dig till Internlagret.`,
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async sendInternalAdEventEmail(input: {
    email: string;
    productTitle: string;
    actorName: string;
    action: string;
  }) {
    const context = {
      ...this.baseContext,
      productTitle: input.productTitle,
      actorName: input.actorName,
      action: input.action,
      internalAdsUrl: `${this.baseUrl}/internal`,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(internalAdEventTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: this.from,
      subject: `Internlagret: ${input.productTitle}`,
      text: `${input.actorName} har ${input.action} ${input.productTitle}.`,
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch (e) {
      this.logger.error('error sending mail', { e });
      throw InternalServerException();
    }
  }

  async cmsTestTemplate(template: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return false;

    if (template === 'verifyEmail') {
      await this.sendVerifyEmail({ email: user.email, token: '123456' });
      return true;
    }
    if (template === 'resetPassword') {
      await this.sendResetPasswordEmail({ email: user.email, token: '123456' });
      return true;
    }
    if (template === 'reportProduct') {
      await this.sendReportProductEmail(
        {
          reporter: user,
          seller: user,
          product: { id: '123', title: 'Rapporterad produkt' },
          report: {
            message:
              'Testar rapportera produkt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            type: ReportProductTypeEnum.OTHER,
          },
        },
        user.email,
      );
      return true;
    }
    if (template === 'reportPurchase') {
      await this.sendReportpurchaseEmail(
        {
          buyer: user,
          seller: user,
          product: { id: '123', title: 'Rapporterad produkt' },
          purchase: { id: '123' },
          report: {
            message:
              'Testar rapportera produkt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            type: ReportPurchaseTypeEnum.DAMAGED,
          },
        },
        user.email,
      );
      return true;
    }
    if (template === 'sendSystemMessageEmail') {
      await this.sendSystemMessageEmail({
        product: { title: 'Product title' },
        receiver: user,
      });
      return true;
    }
    if (template === 'sendUserMessageEmail') {
      await this.sendUserMessageEmail({
        productTitle: 'Product title',
        receiverEmail: user.email,
      });
      return true;
    }
    if (template === 'activatePayouts') {
      await this.sendActivatePayoutsEmail({
        email: user.email,
      });
      return true;
    }
    if (template === 'businessRegistrationNotification') {
      await this.sendBusinessRegistrationNotification({
        email: user.email,
        organizationNumber: '556000-0000',
      });
      return true;
    }
    if (template === 'businessApproved') {
      await this.sendBusinessApprovedEmail({ email: user.email });
      return true;
    }
    if (template === 'welcomeIndividual') {
      await this.sendWelcomeIndividualEmail({ email: user.email });
      return true;
    }

    return false;
  }
}
