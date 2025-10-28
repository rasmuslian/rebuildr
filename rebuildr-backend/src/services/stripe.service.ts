import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { User, UserType } from 'src/entities/user.entity';
import { InternalServerException } from 'src/exceptions';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { GeocodingService } from './geocoding.service';
import { Purchase, SupportedPaymentMethod } from 'src/entities/purchase.entity';
import { idFromObject } from 'src/utility/stripe/utils';
import { formatCountryCodePhonenumber } from 'src/utility/phone-number';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Missing stripe secret key');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async onboardAccount(user: User) {
    let connectedUser = user;
    if (!connectedUser.connectedAccountId) {
      const connectedAccountId =
        await this.createConnectedAccount(connectedUser);
      connectedUser.connectedAccountId = connectedAccountId;
      connectedUser = await this.userRepository.save(connectedUser);
    }

    const accountSession = await this.stripe.accountSessions.create({
      account: connectedUser.connectedAccountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return {
      clientSecret: accountSession.client_secret,
      user: connectedUser,
    };
  }

  async createConnectedAccount(user: User) {
    if (user.type === UserType.BUSINESS) {
      return await this.createConnectedAccountOrganization(user);
    }

    return await this.createConnectedAccountIndividual(user);
  }
  async createConnectedAccountIndividual(user: User) {
    const nameParts = user.name?.split(' ');
    const firstName = nameParts?.[0];
    const lastName = nameParts?.[1];

    const individualParams: Stripe.AccountCreateParams.Individual = {
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      phone: user.phoneNumber
        ? formatCountryCodePhonenumber(user.phoneNumber)
        : undefined,
      address: {
        line1: user.address,
        postal_code: user.postCode ?? undefined,
        city: user.city ?? undefined,
        country: 'SE',
      },
    };
    try {
      const account = await this.stripe.accounts.create({
        business_type: 'individual',
        individual: individualParams,
        //This option must exist even though this is an individual. Link to sellers profile
        business_profile: {
          product_description: 'Säljare hos Rebuildr',
          mcc: '5734', //Computer Software Stores (Stripe default. Not really relevant for this system as an individual).
        },
        email: user.email,
        controller: {
          stripe_dashboard: {
            type: 'none',
          },
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          requirement_collection: 'application',
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
        metadata: {
          userId: user.id,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },

        country: 'SE',
      });
      return account.id;
    } catch (e) {
      this.logger.error('Failed creating connected account', e);
      throw InternalServerException('Failed creating Stripe account');
    }
  }
  async createConnectedAccountOrganization(organizationUser: User) {
    const owner = await this.userRepository.findOne({
      where: {
        organizations: { id: organizationUser.id },
      },
    });
    if (!owner) {
      this.logger.error('Oganization does not have an owner');
      throw InternalServerException();
    }

    try {
      const accountBusiness = await this.stripe.accounts.create({
        business_type: 'company',
        company: {
          structure: 'private_corporation',
          name: organizationUser.username,
          address: {
            line1: organizationUser.address,
            postal_code: organizationUser.postCode,
            city: organizationUser.city,
            country: 'SE',
          },
          phone: organizationUser.phoneNumber
            ? formatCountryCodePhonenumber(organizationUser.phoneNumber)
            : undefined,
          tax_id: organizationUser.organizationNumber ?? undefined,
        },
        business_profile: {
          name: organizationUser.username,
        },
        email: owner.email,
        controller: {
          stripe_dashboard: {
            type: 'none',
          },
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          requirement_collection: 'application',
        },
        metadata: {
          userId: organizationUser.id,
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      return accountBusiness.id;
    } catch (e) {
      this.logger.error('Failed creating connected account', e);
      throw InternalServerException('Failed creating Stripe account');
    }
  }

  async createExternalAccountCard(connectedAccountId: string, token: string) {
    return await this.stripe.accounts.createExternalAccount(
      connectedAccountId,
      {
        external_account: token,
        default_for_currency: true,
      },
    );
  }

  async onBoardAccount(connectedAccountId: string) {
    const accountSession = await this.stripe.accountSessions.create({
      account: connectedAccountId,
      components: {
        account_onboarding: {
          enabled: true,
        },
      },
    });

    return {
      clientSecret: accountSession.client_secret,
    };
  }

  async accountIsEnabled(connectedAccountId: string) {
    const account = await this.retrieveAccount(connectedAccountId);
    const { requirements } = account;
    const missingRequirements =
      !!requirements.currently_due.length ||
      !!requirements.eventually_due.length ||
      !!requirements.past_due.length;

    return (
      !missingRequirements &&
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted
    );
  }

  async retrieveExternalAccounts(connectedAccountId: string) {
    const account = await this.retrieveAccount(connectedAccountId);
    const formattedPayoutAccounts = account.external_accounts.data.reduce(
      (acc, payoutAccount) => {
        if (payoutAccount.object === 'bank_account') {
          return [
            ...acc,
            {
              id: payoutAccount.id,
              type: payoutAccount.object,
              bankName: payoutAccount.bank_name,
              routingNumber: payoutAccount.routing_number,
              last4: payoutAccount.last4,
              default: payoutAccount.default_for_currency,
            },
          ];
        }
        return acc;
      },
      [],
    );
    return formattedPayoutAccounts;
  }

  async retrieveAccount(connectedAccountId: string) {
    const account = await this.stripe.accounts.retrieve(connectedAccountId);
    return account;
  }

  async createPayment(
    sellerAccountId: string,
    amount: number,
    fee: number,
    buyer: User,
    paymentMethod: SupportedPaymentMethod,
  ) {
    const paymentMethods: string[] = [];
    switch (paymentMethod) {
      case SupportedPaymentMethod.CARD:
        paymentMethods.push('card');
        break;
      case SupportedPaymentMethod.SWISH:
        paymentMethods.push('swish');
        break;
    }
    if (!buyer.customerId) {
      const customer = await this.stripe.customers.create({
        email: buyer.email,
        metadata: {
          userId: buyer.id,
        },
      });
      buyer.customerId = customer.id;
      await this.userRepository.save(buyer);
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount,
      currency: 'sek',
      payment_method_types: paymentMethods,
      application_fee_amount: fee,
      customer: buyer.customerId,
      transfer_data: {
        destination: sellerAccountId,
      },
      receipt_email: buyer.email,
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async retrievePayment(paymentIntentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async cancelPayment(paymentIntentId: string) {
    return await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async refundPayment(paymentIntentId: string) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  async getPayoutAmount(paymentIntentId: string) {
    const payment = await this.retrievePayment(paymentIntentId);
    const payoutAmount = payment.amount - payment.application_fee_amount;
    return payoutAmount;
  }

  //Fund become available for payout on a 3-day rolling basis after transfer to connected account
  //https://docs.stripe.com/connect/account-balances
  async payoutAvailable(connectedAccountId: string, paymentIntentId: string) {
    const balances = await this.stripe.balance.retrieve({
      stripeAccount: connectedAccountId,
    });
    const payoutAmount = await this.getPayoutAmount(paymentIntentId);
    return balances.available.some((balance) => balance.amount >= payoutAmount);
  }

  async createPayout(connectedAccountId: string, paymentIntentId: string) {
    const payoutAmount = await this.getPayoutAmount(paymentIntentId);

    try {
      const payout = await this.stripe.payouts.create(
        {
          amount: payoutAmount,
          currency: 'sek',
        },
        {
          stripeAccount: connectedAccountId,
        },
      );
      return payout;
    } catch (e) {
      this.logger.error('Payout failed', {
        error: e,
      });
      throw new Error('Payout failed');
    }
  }

  async deleteAccount(user: User) {
    try {
      const deletedAccount = await this.stripe.accounts.del(
        user.connectedAccountId,
      );
      if (user.customerId) {
        await this.stripe.customers.del(user.customerId);
      }

      return deletedAccount;
    } catch (e) {
      this.logger.error('Error in Stripe deleteAccount', {
        e,
      });
      throw InternalServerException();
    }
  }
  //-------------------- WEBHOOK HANDLERS ----------------------------
  async onAccountUpdated(account: Stripe.Account) {
    const user = await this.userRepository.findOne({
      where: { connectedAccountId: account.id },
    });
    if (!user) {
      this.logger.error('onAccountUpdate failed due to no user found', {
        connectedAccountId: account.id,
      });
      return;
    }

    this.logger.info('onAccountUpdate updating user', {
      id: user.id,
      connectedAccountId: account.id,
    });

    const { individual, company } = account;
    const userIsIndividual = user.type === UserType.PERSONAL;

    if (userIsIndividual) {
      user.name =
        user.name ?? `${individual.first_name} ${individual.last_name}`;
    } else {
      user.name = user.name ?? company.name;
    }

    if (!user.address) {
      const { address } = userIsIndividual ? individual : company;
      try {
        const location = await this.geocodingService.addressToLocation(
          address.line1,
        );
        user.address = address.line1;
        user.addressLocation = {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        };
        user.postCode = address.postal_code;
        user.city = address.city;
      } catch (e) {
        this.logger.error('onAccountUpdate failed updating user address', {
          error: e,
        });
      }
    }
    const { phone } = userIsIndividual ? individual : company;
    user.phoneNumber = user.phoneNumber ?? phone;

    await this.userRepository.save(user);
  }
  async linkChargeToPurchase(charge: Stripe.Charge, logger: Logger) {
    const paymentIntentId = idFromObject(charge.payment_intent);
    const purchase = await this.purchaseRepository.findOne({
      where: { paymentIntentId },
    });
    if (!purchase) {
      logger.error('linkChargeToPurchase: Could not find purchase', {
        charge,
      });
      return;
    }
    logger.info('Link Charge to Purchase', {
      paymentIntentId,
      purchaseId: purchase.id,
      chargeId: charge.id,
    });
    purchase.chargeId = charge.id;
    return await this.purchaseRepository.save(purchase);
  }

  async linkTransferToPurchase(transfer: Stripe.Transfer, logger: Logger) {
    if (!transfer.source_transaction) {
      logger.error('linkTransferToPurchase: Missing source transaction', {
        transfer,
      });
      return;
    }
    if (!transfer.destination_payment) {
      logger.info(
        'linkTransferToPurchase: Transfer is not a transfer to a connected account',
        {
          transfer,
        },
      );
    }
    const chargeId = idFromObject(transfer.source_transaction);

    const purchase = await this.purchaseRepository.findOne({
      where: {
        chargeId,
      },
    });
    if (!purchase) {
      this.logger.error('linkTransferToPurchase: Could not find purchase', {
        transfer: transfer,
      });
      return;
    }
    logger.info('Link Transfer to Purchase', {
      paymentIntentId: purchase.paymentIntentId,
      chargeId,
      purchaseId: purchase.id,
      transferId: transfer.id,
    });
    purchase.transferId = transfer.id;
    purchase.destinationPaymentId = idFromObject(transfer.destination_payment);
    return await this.purchaseRepository.save(purchase);
  }
}
