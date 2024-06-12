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
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterUserResponse)
  async registerUser(@Args('input') input: RegisterUserInput) {
    return await this.authService.registerUser(input);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return await this.authService.login(input);
  }
}
