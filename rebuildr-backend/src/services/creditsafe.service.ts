import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { CreditsafeAPI } from 'src/apis/creditsafe.api';
import {
  ICreditsafeSerializedError,
  ICreditsafeSignupEvaluation,
  IGetDataResponse,
  IGetSignatoryResponse,
} from 'src/apis/types/creditsafe/types';

interface CreditsafeResult<T> {
  data?: T;
  error?: ICreditsafeSerializedError;
}

const serializeError = (error: unknown): ICreditsafeSerializedError => {
  if (error instanceof GraphQLError) {
    return { message: error.message, extensions: error.extensions };
  }
  return { message: String(error) };
};

@Injectable()
export class CreditsafeService {
  constructor(private creditsafeAPI: CreditsafeAPI) {}

  async getBusinessInformation(
    organizationNumber: string,
  ): Promise<CreditsafeResult<IGetDataResponse>> {
    try {
      const data = await this.creditsafeAPI.getData(organizationNumber);
      return { data };
    } catch (error) {
      return { error: serializeError(error) };
    }
  }

  async getSignerInformation(
    organizationNumber: string,
  ): Promise<CreditsafeResult<IGetSignatoryResponse>> {
    try {
      const data = await this.creditsafeAPI.getSignatory(organizationNumber);
      return { data };
    } catch (error) {
      return { error: serializeError(error) };
    }
  }

  /**
   * Decides whether a business signup can be auto-approved: the BankID
   * personal number must match a *solo* signer in Creditsafe's adminSign
   * (someone who alone can act administratively for the company - a match
   * inside a joint/co-signer group doesn't count), with full signatory
   * coverage, and the company itself must not be rejected by getData.
   */
  async evaluateBusinessSignup(
    organizationNumber: string,
    personalNumber: string,
  ): Promise<ICreditsafeSignupEvaluation> {
    const [businessResult, signatoryResult] = await Promise.all([
      this.getBusinessInformation(organizationNumber),
      this.getSignerInformation(organizationNumber),
    ]);

    const normalizedPersonalNumber = personalNumber.replace(/\D/g, '');
    const signatoryReport = signatoryResult.data?.report?.[0];
    const signatoryMatch =
      signatoryReport?.coverage === 'complete' &&
      (signatoryReport.adminSign ?? []).some(
        (group) =>
          group.length === 1 &&
          group[0].personalNumber.replace(/\D/g, '') ===
            normalizedPersonalNumber,
      );

    return {
      checkedAt: new Date(),
      approved: !!businessResult.data && signatoryMatch,
      signatoryMatch,
      getData: businessResult.data ?? { error: businessResult.error },
      getSignatory: signatoryResult.data ?? { error: signatoryResult.error },
    };
  }
}
