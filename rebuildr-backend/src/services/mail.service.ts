import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import handlebars from 'handlebars';
import mjml from 'mjml';
import Mailgun, { Interfaces } from 'mailgun.js';
import * as fs from 'fs';

const verifyEmailTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/verify-email.mjml`,
  'utf8',
);
const resetPasswordTemplate = fs.readFileSync(
  `${__dirname}/../mail-templates/reset-password.mjml`,
  'utf8',
);

@Injectable()
export class MailService {
  private mailgun: Interfaces.IMailgunClient;
  private baseUrl: string;

  constructor() {
    const mailgun = new Mailgun(FormData);

    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
    this.baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8081'
        : 'https://rebuildr-frontend-ee5eu.ondigitalocean.app/';
  }

  async sendVerifyEmail(input: { email: string; token: string }) {
    const context = {
      token: input.token,
      email: encodeURIComponent(input.email),
      baseUrl: this.baseUrl,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(verifyEmailTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: 'rebuildr <no-reply@rebuildr.com>',
      subject: 'Email verification',
      text: 'verify',
      html,
    };
    // TODO: insert correct domain
    // this.mailgun.messages.create('<REBUILDR_DOMAIN>', data);
  }

  async sendResetPasswordEmail(input: { email: string; token: string }) {
    const context = {
      token: input.token,
      email: encodeURIComponent(input.email),
      baseUrl: this.baseUrl,
    };
    const handlebarsTemplate = handlebars.compile(
      mjml(resetPasswordTemplate).html,
    );
    const html = handlebarsTemplate(context);
    const data = {
      to: input.email,
      from: 'rebuildr <no-reply@rebuildr.com>',
      subject: 'Reset password',
      test: 'Reset password',
      html,
    };
    // TODO: insert correct domain
    // this.mailgun.messages.create('<REBUILDR_DOMAIN>', data);
  }
}
