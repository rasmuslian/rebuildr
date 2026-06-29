import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType } from 'src/auth/constants';
import { Organization } from 'src/entities/organization.entity';
import {
  OrganizationMembership,
  OrganizationRoleEnum,
} from 'src/entities/organization-membership.entity';
import { OrganizationInvite } from 'src/entities/organization-invite.entity';
import { OrganizationService } from 'src/services/organization.service';

@InputType()
export class InviteOrganizationMemberInput {
  @Field(() => String)
  email: string;

  @Field(() => OrganizationRoleEnum, { nullable: true })
  role?: OrganizationRoleEnum;
}

@ObjectType()
export class MyOrganizationView {
  @Field(() => Organization, { nullable: true })
  organization?: Organization;

  @Field(() => [OrganizationMembership])
  members: OrganizationMembership[];

  @Field(() => [OrganizationInvite])
  pendingInvites: OrganizationInvite[];
}

/**
 * The logged-in user's own company: view it, invite colleagues, accept invites.
 * Members share the same internal inventory.
 */
@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private organizationService: OrganizationService) {}

  @Query(() => MyOrganizationView)
  @UseGuards(GqlAuthGuard)
  async myOrganization(
    @CurrentUser() user: AuthedUserType,
  ): Promise<MyOrganizationView> {
    const organization = await this.organizationService.getMyOrganization(
      user.id,
    );
    if (!organization) {
      return { organization: undefined, members: [], pendingInvites: [] };
    }
    const [members, pendingInvites] = await Promise.all([
      this.organizationService.listMemberships(organization.id),
      this.organizationService.listInvites(organization.id),
    ]);
    return { organization, members, pendingInvites };
  }

  @Mutation(() => OrganizationInvite)
  @UseGuards(GqlAuthGuard)
  async inviteOrganizationMember(
    @Args('input') input: InviteOrganizationMemberInput,
    @CurrentUser() user: AuthedUserType,
  ): Promise<OrganizationInvite> {
    // Ensure the inviter has a company (auto-created on first use).
    const organization =
      await this.organizationService.getOrCreateUserOrganization(user.id);
    return this.organizationService.inviteMember({
      organizationId: organization.id,
      email: input.email,
      role: input.role,
      invitedByUserId: user.id,
    });
  }

  @Mutation(() => OrganizationMembership)
  @UseGuards(GqlAuthGuard)
  async acceptOrganizationInvite(
    @Args('token') token: string,
    @CurrentUser() user: AuthedUserType,
  ): Promise<OrganizationMembership> {
    return this.organizationService.acceptInvite(token, user.id);
  }
}
