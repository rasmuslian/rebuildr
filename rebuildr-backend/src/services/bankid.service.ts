import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankIdClientV6 } from 'bankid';
import { createHmac } from 'crypto';
import * as IPAddress from 'ipaddr.js';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Identity } from 'src/entities/identity.entity';
import { User, UserType } from 'src/entities/user.entity';
import { ForbiddenException } from 'src/exceptions';
import { CollectBankIDVerifyResponse } from 'src/resolvers/bankid.resolver';
import { CreditsafeService } from 'src/services/creditsafe.service';
import { UserService } from 'src/services/user.service';

export enum BankIDVerifyStatusEnum {
  pending = 'pending',
  complete = 'complete',
  failed = 'failed',
}

interface CacheEntry {
  qrStartToken: string;
  qrStartSecret: string;
  responseArrivedAt: number;
}

const CACHE_TTL_MS = 90_000;

@Injectable()
export class BankIDService {
  private client: BankIdClientV6;

  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private creditsafeService: CreditsafeService,
    private userService: UserService,
  ) {
    this.client = new BankIdClientV6(
      process.env.BANKID_ENV === 'production'
        ? {
            production: true,
            pfx: Buffer.from(process.env.BANKID_PFX_B64 as string, 'base64'),
            passphrase: process.env.BANKID_PASSPHRASE,
          }
        : { production: false },
    );
  }

  async initVerify(
    rawIp: string,
  ): Promise<{ orderRef: string; autoStartToken: string }> {
    const endUserIp =
      process.env.NODE_ENV === 'development'
        ? '127.0.0.1'
        : IPAddress.process(rawIp).toString();

    const { orderRef, autoStartToken, qrStartToken, qrStartSecret } =
      await this.client.authenticate({ endUserIp });

    const entry: CacheEntry = {
      qrStartToken,
      qrStartSecret,
      responseArrivedAt: Math.floor(Date.now() / 1000),
    };
    await this.cache.set(`bankid:${orderRef}`, entry, CACHE_TTL_MS);

    return { orderRef, autoStartToken };
  }

  async collectVerify(
    orderRef: string,
    userId: string,
  ): Promise<CollectBankIDVerifyResponse> {
    const entry = await this.cache.get<CacheEntry>(`bankid:${orderRef}`);
    if (!entry) {
      return { status: BankIDVerifyStatusEnum.failed, qrData: null };
    }

    const qrData = this.generateQrData(entry);
    const response = await this.client.collect({ orderRef });

    if (response.status === 'failed') {
      await this.cache.del(`bankid:${orderRef}`);
      return { status: BankIDVerifyStatusEnum.failed, qrData: null };
    }

    if (response.status === 'complete') {
      await this.cache.del(`bankid:${orderRef}`);

      const personalNumber = response.completionData?.user?.personalNumber;
      if (!personalNumber) {
        this.logger.error(
          'BankID collect: missing personalNumber in completionData',
        );
        return { status: BankIDVerifyStatusEnum.failed, qrData: null };
      }

      const name = response.completionData?.user?.name;
      if (!name) {
        this.logger.warn('BankID collect: missing name', {
          userId,
          personalNumber,
        });
      }
      await this.linkIdentity(userId, personalNumber, name);
      await this.evaluateBusinessSignupIfNeeded(userId, personalNumber);
      return {
        status: BankIDVerifyStatusEnum.complete,
        qrData: null,
      };
    }

    return { status: BankIDVerifyStatusEnum.pending, qrData };
  }

  private generateQrData(entry: CacheEntry): string {
    const elapsed = Math.floor(Date.now() / 1000) - entry.responseArrivedAt;
    const hmac = createHmac('sha256', entry.qrStartSecret);
    hmac.update(`${elapsed}`);
    const hash = hmac.digest('hex');
    return `bankid.${entry.qrStartToken}.${elapsed}.${hash}`;
  }

  async resetIdentity(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { identity: true },
    });
    if (!user?.identity) return false;

    const identityId = user.identity.id;
    await this.userRepository.update(userId, { identityId: null });

    const remaining = await this.userRepository.count({
      where: { identityId },
    });
    if (remaining === 0) {
      await this.identityRepository.delete(identityId);
    }

    return true;
  }

  private async linkIdentity(
    userId: string,
    personalNumber: string,
    name?: string,
  ) {
    const secret = process.env.SSN_HMAC_SECRET ?? 'dev-secret';
    const hashedSsn =
      process.env.NODE_ENV === 'development'
        ? personalNumber
        : createHmac('sha256', secret).update(personalNumber).digest('hex');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { identity: true },
    });

    let identity = await this.identityRepository.findOne({
      where: { ssn: hashedSsn },
    });

    if (user.identity) {
      if (identity && identity.id !== user.identity.id) {
        throw ForbiddenException('Multiple identities linked to the same user');
      }
      await this.identityRepository.update(user.identity.id, {
        name,
        lastIdentifiedAt: new Date(),
      });
      return;
    }

    if (!identity) {
      identity = this.identityRepository.create({ ssn: hashedSsn });
    }

    identity.name = name ?? identity.name;
    identity.lastIdentifiedAt = new Date();
    await this.identityRepository.save(identity);

    await this.userRepository.update(userId, { identityId: identity.id });
  }

  private async evaluateBusinessSignupIfNeeded(
    userId: string,
    personalNumber: string,
  ) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (
        !user ||
        user.type !== UserType.BUSINESS ||
        !user.organizationNumber ||
        user.organizationApprovedAt
      ) {
        return;
      }

      const evaluation = await this.creditsafeService.evaluateBusinessSignup(
        user.organizationNumber,
        personalNumber,
      );

      await this.userRepository.update(userId, {
        creditsafeData: evaluation as unknown as JSON,
      });

      if (evaluation.approved) {
        await this.userService.approveBusinessAccount(userId, false);
      }
    } catch (e) {
      this.logger.error('BankID collect: Creditsafe signup evaluation failed', {
        e,
        userId,
      });
    }
  }
}
