import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput, RegisterUserInput } from 'src/resolvers/auth.resolver';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerUser(input: RegisterUserInput) {
    //validate input
    if (!input.email || !input.password) {
      throw new Error('Invalid input');
    }

    const emailTaken = await this.userRepository.existsBy({
      email: input.email,
    });
    if (emailTaken) {
      return { message: 'Email already in use' };
    }

    //hash password
    const hash = await bcrypt.hash(input.password, 10);

    //create user
    await this.userService.createUser({
      email: input.email,
      password: hash,
    });
    return { message: '' };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findOneByOrFail({
      email: input.email,
    });
    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    return { user: user, accessToken: accessToken };
  }
}
