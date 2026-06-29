import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { SCBAPI } from 'src/apis/scb.api';
import { Organization } from 'src/entities/organization.entity';
import {
  OrganizationMembership,
  OrganizationRoleEnum,
} from 'src/entities/organization-membership.entity';
import {
  OrganizationInvite,
  OrganizationInviteStatusEnum,
} from 'src/entities/organization-invite.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException, NotFoundException } from 'src/exceptions';

export interface OrganizationData {
  name: string;
  address: string;
  zipCode: string;
  city: string;
}

@Injectable()
export class OrganizationService {
  constructor(
    private scbAPI: SCBAPI,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMembership)
    private membershipRepository: Repository<OrganizationMembership>,
    @InjectRepository(OrganizationInvite)
    private inviteRepository: Repository<OrganizationInvite>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async lookupOrganizationNumber(
    orgNumber: string,
  ): Promise<OrganizationData | null> {
    const results = await this.scbAPI.fetchBusiness(orgNumber);
    const business = results[0];

    if (!business) {
      if (process.env.SCB_DEV_STUB === 'true') {
        return {
          name: `Stub AB (${orgNumber})`,
          address: 'Stubgatan 1',
          zipCode: '111 11',
          city: 'Stockholm',
        };
      }
      return null;
    }

    return {
      name: business.Företagsnamn,
      address: business.PostAdress,
      zipCode: business.PostNr,
      city: business.PostOrt,
    };
  }

  async getOrganization(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw NotFoundException('Organization not found');
    }
    return organization;
  }

  async listMemberships(
    organizationId: string,
  ): Promise<OrganizationMembership[]> {
    return this.membershipRepository.find({
      where: { organizationId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  // ---- user <-> organization (used by the app's internal-listing flow) ----

  /** The organization ids the user is a member of. */
  async getUserOrganizationIds(userId: string): Promise<string[]> {
    const memberships = await this.membershipRepository.find({
      where: { userId },
    });
    return memberships.map((m) => m.organizationId);
  }

  /**
   * Returns the user's organization, creating one (with the user as OWNER) the
   * first time a business account needs it — so publishing internally always
   * has a company to attach to.
   */
  async getOrCreateUserOrganization(userId: string): Promise<Organization> {
    const memberships = await this.membershipRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    if (memberships.length) {
      return this.getOrganization(memberships[0].organizationId);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw NotFoundException('User not found');
    }

    const organization = await this.organizationRepository.save(
      this.organizationRepository.create({
        name: user.name || user.username || 'Min organisation',
        organizationNumber: user.organizationNumber ?? null,
      }),
    );
    await this.membershipRepository.save(
      this.membershipRepository.create({
        organizationId: organization.id,
        userId,
        role: OrganizationRoleEnum.OWNER,
      }),
    );
    return organization;
  }

  /** The user's primary organization (or null if none yet). */
  async getMyOrganization(userId: string): Promise<Organization | null> {
    const memberships = await this.membershipRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    if (!memberships.length) return null;
    return this.getOrganization(memberships[0].organizationId);
  }

  async listInvites(organizationId: string): Promise<OrganizationInvite[]> {
    return this.inviteRepository.find({
      where: { organizationId, status: OrganizationInviteStatusEnum.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Invite a colleague by email. If they already have an account they're added
   * to the organization immediately; otherwise the invite stays PENDING until
   * they accept (e.g. after signing up).
   */
  async inviteMember(input: {
    organizationId: string;
    email: string;
    role?: OrganizationRoleEnum;
    invitedByUserId?: string;
  }): Promise<OrganizationInvite> {
    await this.getOrganization(input.organizationId);
    const email = input.email.trim().toLowerCase();
    if (!email) {
      throw BadUserInputException('Email is required');
    }
    const role = input.role ?? OrganizationRoleEnum.MEMBER;

    const invite = this.inviteRepository.create({
      organizationId: input.organizationId,
      email,
      role,
      token: randomUUID(),
      invitedByUserId: input.invitedByUserId,
      status: OrganizationInviteStatusEnum.PENDING,
    });

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      const existingMembership = await this.membershipRepository.findOne({
        where: {
          organizationId: input.organizationId,
          userId: existingUser.id,
        },
      });
      if (!existingMembership) {
        await this.membershipRepository.save(
          this.membershipRepository.create({
            organizationId: input.organizationId,
            userId: existingUser.id,
            role,
          }),
        );
      }
      invite.status = OrganizationInviteStatusEnum.ACCEPTED;
      invite.acceptedAt = new Date();
    }

    return this.inviteRepository.save(invite);
  }

  /** Accept a pending invite (by token), joining the organization. */
  async acceptInvite(
    token: string,
    userId: string,
  ): Promise<OrganizationMembership> {
    const invite = await this.inviteRepository.findOne({ where: { token } });
    if (!invite || invite.status !== OrganizationInviteStatusEnum.PENDING) {
      throw BadUserInputException('Invalid or already used invite');
    }
    const existing = await this.membershipRepository.findOne({
      where: { organizationId: invite.organizationId, userId },
    });
    const membership =
      existing ??
      (await this.membershipRepository.save(
        this.membershipRepository.create({
          organizationId: invite.organizationId,
          userId,
          role: invite.role,
        }),
      ));
    invite.status = OrganizationInviteStatusEnum.ACCEPTED;
    invite.acceptedAt = new Date();
    await this.inviteRepository.save(invite);
    return membership;
  }
}
