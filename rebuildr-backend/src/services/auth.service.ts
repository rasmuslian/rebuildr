import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LoginInput,
  NewPasswordInput,
  RegisterUserInput,
  ResendVerificationMailInput,
  ResetPasswordInput,
  VerifyMailInput,
} from 'src/resolvers/auth.resolver';
import { UserService } from './user.service';
import { MailService } from './mail.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { RefreshToken } from 'src/entities/refreshToken.entity';
import * as crypto from 'crypto';
import dayjs from 'dayjs';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRoleEnum;
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
    private mailService: MailService,
  ) {}

  async registerUser(input: RegisterUserInput) {
    let existingUser = await this.userRepository.findOneBy({
      email: input.email,
    });
    if (!existingUser) {
      //create user
      const password = await bcrypt.hash(input.password, 10);
      const user = new User();
      user.email = input.email;
      user.password = password;
      existingUser = await this.userRepository.save(user);
    }

    if (existingUser.verified) {
      return { message: 'User with email already exist' };
    }

    //generate token
    const token = crypto.randomBytes(10).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    await this.userRepository.update(
      { id: existingUser.id },
      { verifyEmailToken: tokenHash },
    );

    await this.mailService.sendVerifyEmail({
      email: input.email,
      token: token,
    });

    return { message: '' };
  }

  async verifyMail(input: VerifyMailInput) {
    const user = await this.userRepository.findOneBy({ email: input.email });

    if (!user) {
      throw new BadRequestException();
    }

    const matchingTokens = await bcrypt.compare(
      input.verifyEmailToken,
      user.verifyEmailToken,
    );

    if (!matchingTokens) {
      throw new BadRequestException();
    }

    await this.userRepository.update(
      { id: user.id },
      { verified: true, verifyEmailToken: null },
    );

    const { accessToken, refreshToken } = await this.createTokens(user);

    return { user: user, accessToken, refreshToken };
  }

  async resendVerificationMail(input: ResendVerificationMailInput) {
    const user = await this.userRepository.findOneBy({ email: input.email });
    if (!user) {
      throw new BadRequestException();
    }

    if (user.verified) {
      return { message: 'User already verified' };
    }

    //create new token for user
    const token = crypto.randomBytes(10).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    await this.userRepository.update(
      { id: user.id },
      { verifyEmailToken: tokenHash },
    );
    //send new mail
    await this.mailService.sendVerifyEmail({
      email: input.email,
      token: token,
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
    if (!user) {
      throw new NotFoundException();
    }
    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw new NotFoundException();
    }

    if (!user.verified) {
      throw new NotFoundException();
    }

    const tokens = await this.createTokens(user);

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

    const tokens = await this.createTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async createTokens(user: User) {
    //create accessToken
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    //delete existing refresh token
    await this.refreshTokenRepository.delete({ userId: user.id });
    //create refreshToken
    const token = crypto.randomBytes(20).toString('hex');
    const hash = await bcrypt.hash(token, 10);
    const refreshToken = new RefreshToken();
    refreshToken.token = hash;
    refreshToken.expiresAt = dayjs().add(60, 'day').toDate();
    refreshToken.user = user;
    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, refreshToken: token };
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await this.userRepository.findOneBy({ email: email });

    if (user) {
      const token = crypto.randomBytes(10).toString('hex');
      const tokenHash = await bcrypt.hash(token, 10);
      await this.userRepository.update(
        { id: user.id },
        { resetPasswordToken: tokenHash },
      );
      await this.mailService.sendResetPasswordEmail({
        email: email,
        token: token,
      });
    }

    return { message: '' };
  }

  async newPassword(input: NewPasswordInput) {
    const user = await this.userRepository.findOneBy({ email: input.email });

    if (!user || !user.resetPasswordToken) {
      throw new BadRequestException();
    }

    const matchingTokens = await bcrypt.compare(
      input.resetPasswordToken,
      user.resetPasswordToken,
    );
    if (!matchingTokens) {
      throw new BadRequestException();
    }

    const password = await bcrypt.hash(input.password, 10);
    await this.userRepository.update(
      { email: input.email },
      { password: password, resetPasswordToken: null },
    );

    const { accessToken, refreshToken } = await this.createTokens(user);

    return { user: user, accessToken, refreshToken };
  }
}
