import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInput, RegisterUserInput } from 'src/resolvers/auth.resolver';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { RefreshToken } from 'src/entities/refreshToken.entity';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
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
    const user = await this.userRepository.findOneOrFail({
      where: {
        email: input.email,
      },
      relations: {
        refreshToken: true,
      },
    });
    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw new UnauthorizedException();
    }

    const tokens = await this.createTokens(user, user.refreshToken);

    return {
      user: user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getNewTokens(accessToken: string, refreshTokenHash: string) {
    //extract user id from accessToken
    const { sub: userId }: AccessTokenPayload =
      await this.jwtService.decode(accessToken);

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        refreshToken: true,
      },
    });
    if (!user || !user.refreshToken) {
      throw new BadRequestException();
    }

    const tokensMatch = await bcrypt.compare(
      refreshTokenHash,
      user.refreshToken.token,
    );
    if (!tokensMatch) {
      console.log('Refresh token does not match');
      return { accessToken: '', refreshToken: '' };
    }

    const expired = dayjs(user.refreshToken.expiresAt).isBefore(dayjs());
    if (expired) {
      console.log('Refresh token expired');
      return { accessToken: '', refreshToken: '' };
    }

    const tokens = await this.createTokens(user, user.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async createTokens(user: User, existingRefreshToken?: RefreshToken) {
    //create accessToken
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    //create refreshToken
    const token = crypto.randomBytes(20).toString('hex');
    const hash = await bcrypt.hash(token, 10);
    const refreshToken = existingRefreshToken ?? new RefreshToken();
    refreshToken.token = hash;
    refreshToken.expiresAt = dayjs().add(60, 'day').toDate();
    refreshToken.user = user;
    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, refreshToken: token };
  }
}
