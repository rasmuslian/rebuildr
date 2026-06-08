import { Injectable, Logger } from '@nestjs/common';
import {
  FinalizeUserInput,
  LoginInput,
  LogoutInput,
  NewPasswordInput,
  RegisterUserInput,
  ResendVerificationMailInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from 'src/resolvers/auth.resolver';
import { MailService } from './mail.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import {
  ILike,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, jwtConstants } from 'src/auth/constants';
import { RefreshToken } from 'src/entities/refresh-token.entity';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import { RequestType } from 'src/app.module';
import { passwordRegex } from 'src/constants/regexp';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private mailService: MailService,
  ) {}

  async usernameIsValid(username: string) {
    const existingUsername = await this.userRepository.findOne({
      where: { username: ILike(username) },
    });
    return !existingUsername;
  }

  async registerUser(input: RegisterUserInput) {
    let user = await this.userRepository.findOneBy({
      email: input.email,
    });
    if (!user) {
      user = new User();
      user.email = input.email;
    }
    //Make sure to reset this in case that the user already exists.
    //This will happen if the user canceled the registration after having verified their email
    user.emailVerifiedAt = null;

    //generate token
    const token = await this.generateEmailValidationCode();
    user.verifyEmailToken = token.hash;
    const registeredUser = await this.userRepository.save(user);

    await this.mailService.sendVerifyEmail({
      email: input.email,
      token: token.code,
    });

    return registeredUser;
  }

  async finalizeUser(input: FinalizeUserInput, currentUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user || !user.emailVerifiedAt) {
      throw BadUserInputException();
    }

    user.username = input.username;
    const validPassword = new RegExp(passwordRegex).test(input.password);
    if (!validPassword) {
      throw BadUserInputException('Invalid password');
    }
    user.password = await bcrypt.hash(input.password, 10);

    const savedUser = await this.userRepository.save(user);

    return savedUser;
  }

  async generateEmailValidationCode() {
    const code = `00000${Math.floor(Math.random() * 999999)}`.slice(-6);

    return { code, hash: await bcrypt.hash(code, 10) };
  }

  async verifyEmail(input: VerifyEmailInput, req: RequestType) {
    const user = await this.userRepository.findOneBy({
      email: input.email.toLowerCase().trim(),
    });

    if (!user?.verifyEmailToken) {
      throw BadUserInputException('Failed to verify user due to bad input');
    }

    const matchingTokens = await bcrypt.compare(
      input.verifyEmailToken,
      user.verifyEmailToken,
    );

    if (!matchingTokens) {
      throw BadUserInputException('Failed to verify user due to bad input');
    }

    const randomPassword = crypto.randomBytes(20).toString('hex');
    const hash = await bcrypt.hash(randomPassword, 10);
    await this.userRepository.update(
      { id: user.id },
      { emailVerifiedAt: new Date(), verifyEmailToken: null, password: hash },
    );
    return await this.login(
      { email: user.email, password: randomPassword },
      req,
    );
  }

  async resendVerificationMail(input: ResendVerificationMailInput) {
    const user = await this.userRepository.findOneBy({ email: input.email });
    if (!user) {
      throw BadUserInputException();
    }

    if (user.emailVerifiedAt) {
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

  async login(input: LoginInput, req: RequestType) {
    const user = await this.userRepository.findOne({
      where: {
        email: input.email.toLowerCase().trim(),
      },
      relations: {
        refreshTokens: true,
      },
    });
    if (!user) {
      throw BadUserInputException('Invalid input');
    }
    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw BadUserInputException('Invalid input');
    }

    if (!user.emailVerifiedAt) {
      throw BadUserInputException('Invalid input');
    }

    const tokens = await this.createTokens(user);

    //Since user is now authenticated, attach user to request to be used in later stages of the request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async cmsLogin(input: LoginInput, req: RequestType) {
    const user = await this.userRepository.findOne({
      where: {
        email: input.email.toLowerCase().trim(),
      },
      relations: {
        refreshTokens: true,
      },
    });
    if (!user) {
      throw BadUserInputException('Invalid input');
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      throw ForbiddenException();
    }

    const passwordCorrect = await bcrypt.compare(input.password, user.password);
    if (!passwordCorrect) {
      throw BadUserInputException('Invalid input');
    }

    if (!user.emailVerifiedAt) {
      throw BadUserInputException('Invalid input');
    }

    const tokens = await this.createTokens(user);

    //Since user is now authenticated, attach user to request to be used in later stages of the request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(input: LogoutInput): Promise<boolean> {
    const payload: AccessTokenPayload = await this.jwtService.decode(
      input.accessToken,
    );

    const validTokens = await this.refreshTokenRepository.find({
      where: {
        userId: payload.sub,
      },
    });

    for (const token of validTokens) {
      const matchingToken = await bcrypt.compare(
        input.refreshToken,
        token.token,
      );
      if (matchingToken) {
        const response = await this.refreshTokenRepository.delete(token);
        return response.affected && response.affected > 0;
      }
    }

    return false;
  }

  /**
   * Generates a new refreshToken and accessToken.
   *
   * NOTE: Must not throw UnuthenticatedException,
   * that would cause an infinite refreshtoken loop from frontend.
   */
  async getNewTokens(accessToken: string, refreshTokenHash: string) {
    //extract user id from accessToken
    const { sub: userId }: AccessTokenPayload =
      await this.jwtService.decode(accessToken);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { accessToken: '', refreshToken: '' };
    }

    //delete old refresh tokens
    await this.refreshTokenRepository.delete({
      userId: userId,
      expiresAt: LessThanOrEqual(new Date()),
    });

    const validTokens = await this.refreshTokenRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
    });

    let currentToken: RefreshToken | undefined = undefined;
    for (const token of validTokens) {
      const matchingToken = await bcrypt.compare(refreshTokenHash, token.token);
      if (matchingToken) {
        currentToken = token;
      }
    }

    //token has either expired or does not match
    if (!currentToken) {
      return { accessToken: '', refreshToken: '' };
    }

    //delete currentToken
    await this.refreshTokenRepository.delete({ id: currentToken.id });

    const tokens = await this.createTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async createTokens(user: User) {
    const accessToken = await this.createJwtToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return { accessToken, refreshToken };
  }
  createJwtToken = async (user: User) => {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    return accessToken;
  };
  async createRefreshToken(user: User) {
    const token = crypto.randomBytes(20).toString('hex');
    const hash = await bcrypt.hash(token, 10);
    const refreshToken = new RefreshToken();
    refreshToken.token = hash;
    refreshToken.expiresAt = dayjs().add(60, 'day').toDate();
    refreshToken.user = user;
    user.refreshTokens = [...(user.refreshTokens ?? []), refreshToken];
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async invalidateRefreshToken(oldRefreshTokenId: string) {
    const now = new Date();

    await this.refreshTokenRepository.update(
      { id: oldRefreshTokenId, expiresAt: MoreThanOrEqual(now) },
      { expiresAt: now },
    );
  }

  async updateRefreshToken(
    user: User,
    oldRefreshTokenId?: string,
  ): Promise<string> {
    if (oldRefreshTokenId) {
      await this.invalidateRefreshToken(oldRefreshTokenId);
    }
    const refreshToken = await this.createRefreshToken(user);
    return refreshToken;
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await this.userRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });

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

    if (!user?.resetPasswordToken) {
      throw BadUserInputException(
        'Failed to set new password due to bad user input',
      );
    }

    const matchingTokens = await bcrypt.compare(
      input.resetPasswordToken,
      user.resetPasswordToken,
    );
    if (!matchingTokens) {
      throw BadUserInputException(
        'Failed to set new password due to bad user input',
      );
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
