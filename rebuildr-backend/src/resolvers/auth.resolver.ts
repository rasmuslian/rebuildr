import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';
import { z } from 'zod';
import { UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { RequestType } from 'src/app.module';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType, authThrottleConfig } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { Throttle } from '@nestjs/throttler';

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  email: string;
}
const registerUserSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),
});
@InputType()
export class FinalizeUserInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType()
export class ResendVerificationMailInput {
  @Field(() => String)
  email: string;
}
const resendVerificationMailSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase().trim()),
});

@InputType()
export class VerifyEmailInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  verifyEmailToken: string;
}

@ObjectType()
class ResendVerificationMailResponse {
  @Field(() => String)
  message: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
@InputType()
export class LogoutInput {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}
@ObjectType()
class LoginResponse {
  @Field(() => User)
  user: User;

  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}

@InputType()
class GetNewTokensInput {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}

@ObjectType()
class GetNewTokensResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}

@InputType()
export class ResetPasswordInput {
  @Field(() => String)
  email: string;
}
@ObjectType()
class ResetPasswordResponse {
  @Field(() => String)
  message: string;
}

@InputType()
export class NewPasswordInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  resetPasswordToken: string;
}
const newPasswordSchema = z.object({
  email: z.string().min(1).toLowerCase().trim(),
  password: z.string().min(1),
  resetPasswordToken: z.string().min(1),
});

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => Boolean)
  async usernameIsValid(@Args('username') username: string) {
    return await this.authService.usernameIsValid(username);
  }

  @Mutation(() => User)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async registerUser(@Args('input') input: RegisterUserInput) {
    return await this.authService.registerUser(input);
  }

  @Mutation(() => LoginResponse)
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
    @Context() req: RequestType,
  ) {
    return await this.authService.verifyEmail(input, req);
  }

  @Mutation(() => ResendVerificationMailResponse)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  @UsePipes(new ZodValidationPipe(resendVerificationMailSchema))
  async resendVerificationMail(
    @Args('input') input: ResendVerificationMailInput,
  ) {
    return await this.authService.resendVerificationMail(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async finalizeUser(
    @Args('input') input: FinalizeUserInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.authService.finalizeUser(input, user.id);
  }

  @Mutation(() => LoginResponse)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  async login(
    @Args('input') input: LoginInput,
    @Context('req') req: RequestType,
  ) {
    return await this.authService.login(input, req);
  }

  @Mutation(() => Boolean)
  async logout(@Args('input') input: LogoutInput) {
    return await this.authService.logout(input);
  }

  @Mutation(() => LoginResponse)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  async cmsLogin(
    @Args('input') input: LoginInput,
    @Context('req') req: RequestType,
  ) {
    return await this.authService.cmsLogin(input, req);
  }

  @Mutation(() => GetNewTokensResponse)
  async getNewTokens(@Args('input') input: GetNewTokensInput) {
    return this.authService.getNewTokens(input.accessToken, input.refreshToken);
  }

  @Mutation(() => ResetPasswordResponse)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ auth: authThrottleConfig })
  async resetPassword(@Args('input') input: ResetPasswordInput) {
    return await this.authService.resetPassword(input);
  }

  @Mutation(() => LoginResponse)
  @UsePipes(new ZodValidationPipe(newPasswordSchema))
  async newPassword(@Args('input') input: NewPasswordInput) {
    return await this.authService.newPassword(input);
  }

}
