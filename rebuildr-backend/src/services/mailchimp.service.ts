import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { BadUserInputException } from 'src/exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface MailchimpError extends Error {
  status?: number;
  response?: {
    body?: {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
    };
  };
}

@Injectable()
export class MailchimpService implements OnModuleInit {
  newsletterListId: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.newsletterListId = process.env.MAILCHIMP_NEWLETTER_AUDIENCE_ID;
    if (!this.newsletterListId) {
      this.logger.error('Missing newsletter list id!');
    }
  }

  async onModuleInit() {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    try {
      const response = await this.ping();
      this.logger.info('Mailchimp setup:', response);
    } catch (error) {
      this.logger.error('Mailchimp setup:', error);
    }
  }

  async ping() {
    return mailchimp.ping.get();
  }

  async addSubscriberToNewsletterList(
    email: string,
    firstName?: string,
    lastName?: string,
  ): Promise<boolean> {
    try {
      await mailchimp.lists.addListMember(this.newsletterListId, {
        email_address: email,
        status: 'subscribed',
        ...(firstName || lastName
          ? {
              merge_fields: {
                ...(firstName ? { FNAME: firstName } : {}),
                ...(lastName ? { LNAME: lastName } : {}),
              },
            }
          : {}),
      });

      return true;
    } catch (error) {
      const err = error as MailchimpError;
      const title = err.response?.body?.title;

      if (title === 'Member Exists') {
        throw BadUserInputException('Denna email är redan prenumerant!');
      }

      throw BadUserInputException('Lyckades inte lägga till email!');
    }
  }
}
