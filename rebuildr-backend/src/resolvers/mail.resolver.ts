import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { MailService } from 'src/services/mail.service';

@InputType()
class CmsTestTemplateInput {
  @Field()
  template: string;
}

@Resolver()
export class MailResolver {
  constructor(private mailService: MailService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsTestTemplate(
    @Args('input') input: CmsTestTemplateInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.mailService.cmsTestTemplate(input.template, user.id);
  }
}
