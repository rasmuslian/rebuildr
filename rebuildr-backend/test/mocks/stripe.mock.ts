/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { SupportedPaymentMethod, Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import Stripe from 'stripe';
import { Logger } from 'winston';

@Injectable()
export class StripeMock {
  onboardAccount(
    user: User,
  ): Promise<{ clientSecret: string; user: User; fields: string[] }> {
    return new Promise(() => ({
      clientSecret: 'clientSecret',
      user,
      fields: [],
    }));
  }
  createConnectedAccount(user: User): Promise<string> {
    throw new Error('Method not implemented.');
  }
  createConnectedAccountIndividual(user: User): Promise<string> {
    throw new Error('Method not implemented.');
  }
  createConnectedAccountOrganization(organizationUser: User): Promise<string> {
    throw new Error('Method not implemented.');
  }
  createExternalAccountCard(
    connectedAccountId: string,
    token: string,
  ): Promise<Stripe.Response<Stripe.ExternalAccount>> {
    throw new Error('Method not implemented.');
  }
  accountIsEnabled(connectedAccountId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  retrieveExternalAccounts(connectedAccountId: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  retrieveAccount(
    connectedAccountId: string,
  ): Promise<Stripe.Response<Stripe.Account>> {
    throw new Error('Method not implemented.');
  }
  createPayment(
    sellerAccountId: string,
    amount: number,
    fee: number,
    buyer: User,
    paymentMethod: SupportedPaymentMethod,
    description: string,
  ): Promise<{ id: string; clientSecret: string }> {
    return Promise.resolve({
      id: 'paymentId',
      clientSecret: 'clientSecret',
    });
  }
  retrievePayment(
    paymentIntentId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return Promise.resolve({
      id: 'paymentIntentId',
      status: 'succeeded',
      client_secret: 'client_secret',
    } as Stripe.Response<Stripe.PaymentIntent>);
  }
  cancelPayment(
    paymentIntentId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    throw new Error('Method not implemented.');
  }
  refundPayment(
    paymentIntentId: string,
  ): Promise<Stripe.Response<Stripe.Refund>> {
    throw new Error('Method not implemented.');
  }
  getPayoutAmount(paymentIntentId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  payoutAvailable(
    connectedAccountId: string,
    paymentIntentId: string,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  createPayout(
    connectedAccountId: string,
    paymentIntentId: string,
  ): Promise<Stripe.Response<Stripe.Payout>> {
    throw new Error('Method not implemented.');
  }
  deleteAccount(user: User): Promise<Stripe.Response<Stripe.DeletedAccount>> {
    throw new Error('Method not implemented.');
  }
  onAccountUpdated(account: Stripe.Account): Promise<void> {
    throw new Error('Method not implemented.');
  }
  linkChargeToPurchase(
    charge: Stripe.Charge,
    logger: Logger,
  ): Promise<Purchase> {
    throw new Error('Method not implemented.');
  }
  linkTransferToPurchase(
    transfer: Stripe.Transfer,
    logger: Logger,
  ): Promise<Purchase> {
    throw new Error('Method not implemented.');
  }
  delete(connectedAccountId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
