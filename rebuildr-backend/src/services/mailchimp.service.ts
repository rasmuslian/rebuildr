import { Injectable, OnModuleInit } from '@nestjs/common';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { BadUserInputException } from 'src/exceptions';

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
  onModuleInit() {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });
  }

  async ping() {
    return mailchimp.ping.get();
  }

  async addSubscriber(listId: string, email: string): Promise<boolean> {
    try {
      await mailchimp.lists.addListMember(listId, {
        email_address: email,
        status: 'subscribed',
      });

      return true;
    } catch (error) {
      const err = error as MailchimpError;
      const title = err.response?.body?.title;

      if (title === 'Member Exists') {
        throw BadUserInputException('Email redan finns!');
      }

      throw BadUserInputException('Lyckades inte lägga till email!');
    }
  }
}
