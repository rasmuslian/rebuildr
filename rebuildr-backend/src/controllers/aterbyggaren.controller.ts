import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

import { AccessTokenPayload, AuthedUserType } from 'src/auth/constants';
import { EnvironmentVariables } from 'src/config';
import { AterbyggarenService } from 'src/services/aterbyggaren.service';

interface StreamBody {
  chatId?: string;
  message: string;
  guestId?: string;
}

@Controller('aterbyggaren')
export class AterbyggarenController {
  constructor(
    private aterbyggarenService: AterbyggarenService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Get('chats')
  async listChats(@Req() request: Request) {
    return this.aterbyggarenService.listChats(await this.getUser(request));
  }

  @Get('chats/:chatId/messages')
  async getMessages(@Param('chatId') chatId: string, @Req() request: Request) {
    return this.aterbyggarenService.getMessages(
      chatId,
      await this.getUser(request),
    );
  }

  @Delete('chats/:chatId')
  async deleteChat(@Param('chatId') chatId: string, @Req() request: Request) {
    return this.aterbyggarenService.deleteChat(
      chatId,
      await this.getUser(request),
    );
  }

  @Post('chat/stream')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async streamChat(
    @Body() body: StreamBody,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user = await this.getUser(request);
    return this.aterbyggarenService.streamMessage(
      body,
      { user, guestId: body.guestId },
      request,
      response,
    );
  }

  private async getUser(request: Request): Promise<AuthedUserType | undefined> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) return undefined;

    try {
      const payload: AccessTokenPayload = await this.jwtService.verifyAsync(
        token,
        { secret: this.configService.get('JWT_SECRET') },
      );
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return undefined;
    }
  }
}
