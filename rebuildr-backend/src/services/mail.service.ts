import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun, {
  Interfaces,
  Enums,
  MailgunClientOptions,
  MessagesSendResult,
} from 'mailgun.js';

// ('72fccdd7-1f6fcc04');
@Injectable()
export class MailService {
  private mailgun: Interfaces.IMailgunClient;

  constructor() {
    const mailgun = new Mailgun(FormData);

    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '72fccdd7-1f6fcc04',
    });
  }

  async sendVerifyEmail() {
    const data = {
      to: 'emil.stolpe@swace.se',
      from: 'rebuildr <no-reply@rebuildr.com>',
      subject: 'subject',
      text: 'verify',
      html: '<h1>Verify</h1>',
    };
    // this.mailgun.messages.create(data);
  }
}
