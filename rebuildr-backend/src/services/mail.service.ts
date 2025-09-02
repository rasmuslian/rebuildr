import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import handlebars from 'handlebars';
import mjml from 'mjml';
import Mailgun, { Interfaces } from 'mailgun.js';
import * as fs from 'fs';
import { InternalServerException } from 'src/exceptions';
import { User } from 'src/entities/user.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Product } from 'src/entities/product.entity';
import { ReportPurchase } from 'src/entities/report-purchase.entity';

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
const systemMessageTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/system-message.mjml`,
  'utf8',
);
const userMessageTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/user-message.mjml`,
  'utf8',
);

const MAILGUN_DOMAIN = 'rebuildr.se';

@Injectable()
export class MailService {
  private mailgun: Interfaces.IMailgunClient;
  private from: string;
  private baseUrl: string;

  constructor() {
    const mailgun = new Mailgun(FormData);

    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: 'https://api.eu.mailgun.net',
    });
    this.baseUrl = process.env.WEB_BASE_URL;
    this.from = 'Reuildr <hej@rebuildr.se>';
  }

  async sendVerifyEmail(input: { email: string; token: string }) {
    const context = {
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
    } catch {
      throw InternalServerException();
    }
  }

  async sendResetPasswordEmail(input: { email: string; token: string }) {
    const context = {
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
    } catch {
      throw InternalServerException();
    }
  }

  async sendReportpurchaseEmail(input: {
    buyer: User;
    seller: User;
    product: Product;
    purchase: Purchase;
    report: ReportPurchase;
  }) {
    const context = {
      productTitle: input.product.title,
      message: input.report.message,
      type: input.report.type,
      buyerEmail: input.buyer.email,
      sellerEmail: input.seller.email,
      productId: input.product.id,
      purchaseId: input.purchase.id,
      offerId: input.purchase.rockerOfferId,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(reportPurchaseTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: 'hej@rebuildr.se',
      from: this.from,
      subject: 'Rapportering av köp',
      text: 'Rapportering av köp',
      html,
    };
    try {
      await this.mailgun.messages.create(MAILGUN_DOMAIN, data);
    } catch {
      throw InternalServerException();
    }
  }

  async sendSystemMessageEmail(input: { product: Product; receiver: User }) {
    const context = {
      productTitle: input.product.title,
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
    } catch {
      throw InternalServerException();
    }
  }

  async sendUserMessageEmail(input: {
    productTitle: string;
    receiverEmail: string;
  }) {
    const context = {
      productTitle: input.productTitle,
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
    } catch {
      throw InternalServerException();
    }
  }
}
