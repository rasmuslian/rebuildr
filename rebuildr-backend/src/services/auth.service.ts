import { Injectable } from '@nestjs/common';
import { RegisterUserInput } from 'src/resolvers/auth.resolver';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerUser(input: RegisterUserInput) {
    //validate input
    if (!input.email || !input.password) {
      throw new Error('Invalid input');
    }
    const emailRegex = new RegExp(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    );
    const validMail = emailRegex.test(input.email);
    if (!validMail) {
      return { message: 'Invalid mail' };
    }
    //validate password
    //check if user exist
    const emailTaken = await this.userRepository.existsBy({
      email: input.email,
    });
    if (emailTaken) {
      return { message: 'Email already in use' };
    }

    //check that email is unique
    console.log('email: ', input.email);

    //hash password
    const hash = await bcrypt.hash(input.password, 10);

    //create user
    await this.userService.createUser({
      email: input.email,
      password: hash,
    });
    return { message: '' };
  }
}
