import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from 'src/services/auth.service';

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class RegisterUserResponse {
  @Field(() => String)
  message: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterUserResponse)
  async registerUser(@Args('input') input: RegisterUserInput) {
    return await this.authService.registerUser(input);
  }
}
