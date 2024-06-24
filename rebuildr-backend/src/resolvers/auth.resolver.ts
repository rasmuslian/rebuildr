import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';
import { z } from 'zod';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/zodValidationPipe';

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
const registerUserSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string(),
});

@ObjectType()
export class RegisterUserResponse {
  @Field(() => String)
  message: string;
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
    .transform((value) => value.toLowerCase()),
});

@InputType()
export class VerifyMailInput {
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

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterUserResponse)
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async registerUser(@Args('input') input: RegisterUserInput) {
    return await this.authService.registerUser(input);
  }

  @Mutation(() => LoginResponse)
  async verifyMail(@Args('input') input: VerifyMailInput) {
    return await this.authService.verifyMail(input);
  }

  @Mutation(() => ResendVerificationMailResponse)
  @UsePipes(new ZodValidationPipe(resendVerificationMailSchema))
  async resendVerificationMail(
    @Args('input') input: ResendVerificationMailInput,
  ) {
    return await this.authService.resendVerificationMail(input);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return await this.authService.login(input);
  }

  @Mutation(() => GetNewTokensResponse)
  async getNewTokens(@Args('input') input: GetNewTokensInput) {
    return this.authService.getNewTokens(input.accessToken, input.refreshToken);
  }
}
