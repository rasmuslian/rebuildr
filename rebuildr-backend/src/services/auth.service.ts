import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
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
    private mailService: MailService,
  ) {}

  async registerUser(input: RegisterUserInput) {
    //validate input
    if (!input.email) {
      throw new Error('Invalid input');
    }

    let existingUser = await this.userRepository.findOneBy({
      email: input.email,
    });
    if (!existingUser) {
      //create user
      const password = await bcrypt.hash(input.password, 10);
      existingUser = await this.userService.createUser({
        email: input.email,
        password: password,
      });
    } else if (existingUser.verified) {
      return { message: 'User with email already exist' };
    }

    //generate token
    const token = crypto.randomBytes(10).toString('hex');
    const verifiedEmailToken = await bcrypt.hash(token, 10);
    await this.userRepository.update(
      { id: existingUser.id },
      { verifyEmailToken: verifiedEmailToken },
    );

    await this.mailService.sendVerifyEmail({
      email: input.email,
      token: verifiedEmailToken,
    });

    return { message: '' };
  }

  async verifyMail(input: VerifyMailInput) {
    const user = await this.userRepository.findOneBy({ id: input.email });

    if (!user) {
      throw new UnauthorizedException();
    }

    const matchingTokens = await bcrypt.compare(
      input.verifyEmailToken,
      user.verifyEmailToken,
    );

    if (!matchingTokens) {
      throw new UnauthorizedException();
    }

    await this.userRepository.update(
      { id: user.id },
      { verified: true, verifyEmailToken: null },
    );

    //create accessToken
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    return { user: user, accessToken: accessToken };
  }

  async resendVerificationMail(input: ResendVerificationMailInput) {
    //user exist?
    //[no] return invalid
    const user = await this.userRepository.findOneBy({ email: input.email });
    if (!user) {
      throw new UnauthorizedException();
    }

    //verified?
    //[yes] return "user exist"
    if (user.verified) {
      return { message: 'User already verified' };
    }

    //create new token for user
    const token = crypto.randomBytes(10).toString('hex');
    const verifiedEmailToken = await bcrypt.hash(token, 10);
    await this.userRepository.update(
      { id: user.id },
      { verifyEmailToken: verifiedEmailToken },
    );
    //send new mail
    await this.mailService.sendVerifyEmail({
      email: input.email,
      token: verifiedEmailToken,
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
      throw new UnauthorizedException();
    }
    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw new UnauthorizedException();
    }

    if (!user.verified) {
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

  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await this.userRepository.findOneBy({ email: email });

    if (user) {
      const token = crypto.randomBytes(10).toString('hex');
      const resetPasswordToken = await bcrypt.hash(token, 10);
      await this.userRepository.update(
        { id: user.id },
        { resetPasswordToken: resetPasswordToken },
      );
      await this.mailService.sendResetPasswordEmail({
        email: email,
        token: resetPasswordToken,
      });
    }

    return { message: '' };
  }

  async newPassword(input: NewPasswordInput) {
    const user = await this.userRepository.findOneBy({ email: input.email });

    if (!user) {
      throw new UnauthorizedException();
    }

    const matchingTokens = input.resetPasswordToken === user.resetPasswordToken;
    if (!matchingTokens) {
      throw new UnauthorizedException();
    }

    const password = await bcrypt.hash(input.password, 10);
    await this.userRepository.update(
      { email: input.email },
      { password: password, resetPasswordToken: null },
    );

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    return { user: user, accessToken: accessToken };
  }
}
