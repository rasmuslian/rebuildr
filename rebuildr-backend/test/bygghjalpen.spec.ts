import { streamText } from 'ai';
import { EventEmitter } from 'events';
import { Request, Response } from 'express';

import {
  BygghjalpenMessage,
  BygghjalpenMessageRole,
  BygghjalpenMessageStatus,
} from 'src/entities/bygghjalpen-message.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { BygghjalpenService } from 'src/services/bygghjalpen.service';

type GetContextMessages = (
  chatId: string,
  currentUserMessageId?: string,
) => Promise<{ role: string; content: string }[]>;

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => jest.fn(() => 'gemini-model')),
}));

jest.mock('ai', () => ({
  streamText: jest.fn(),
  stepCountIs: jest.fn((stepCount: number) => ({ stepCount })),
  tool: jest.fn((config) => config),
}));

const mockStreamText = jest.mocked(streamText);

describe('BygghjalpenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('excludes incomplete previous turns from the next model context', async () => {
    const messages = [
      createMessage(
        'user-complete',
        BygghjalpenMessageRole.USER,
        'Första frågan',
      ),
      createMessage(
        'assistant-complete',
        BygghjalpenMessageRole.ASSISTANT,
        'Första svaret',
      ),
      createMessage(
        'user-interrupted',
        BygghjalpenMessageRole.USER,
        'Frågan som avbröts',
      ),
      createMessage(
        'assistant-interrupted',
        BygghjalpenMessageRole.ASSISTANT,
        'Halvt svar',
        BygghjalpenMessageStatus.INTERRUPTED,
      ),
      createMessage(
        'user-orphaned',
        BygghjalpenMessageRole.USER,
        'Frågan utan assistentsvar',
      ),
      createMessage(
        'user-current',
        BygghjalpenMessageRole.USER,
        'Nuvarande fråga',
      ),
    ];
    const service = createService({ messages });

    const getContextMessages = Reflect.get(
      service,
      'getContextMessages',
    ) as GetContextMessages;

    const contextMessages = await getContextMessages.call(
      service,
      'chat-1',
      'user-current',
    );

    expect(contextMessages).toEqual([
      { role: 'user', content: 'Första frågan' },
      { role: 'assistant', content: 'Första svaret' },
      { role: 'user', content: 'Nuvarande fråga' },
    ]);
  });

  it('marks length-limited assistant responses as interrupted', async () => {
    mockStreamText.mockReturnValue({
      finishReason: Promise.resolve('length'),
      textStream: createTextStream(['Planera materialet i steg.']),
    } as unknown as ReturnType<typeof streamText>);

    const savedMessages: Partial<BygghjalpenMessage>[] = [];
    const service = createService({ messages: savedMessages });
    const request = new EventEmitter() as Request;
    const response = createResponse();

    await service.streamMessage(
      { message: 'Hur planerar jag materialåtgång för gipsvägg?' },
      {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          role: UserRoleEnum.USER,
        },
      },
      request,
      response,
    );

    const assistantMessage = savedMessages.find(
      (message) => message.role === BygghjalpenMessageRole.ASSISTANT,
    );

    expect(assistantMessage?.status).toBe(BygghjalpenMessageStatus.INTERRUPTED);
    expect(assistantMessage?.content).toContain(
      'Jag nådde längdgränsen för svaret',
    );
    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('event: done'),
    );
  });
});

const createService = ({
  messages,
}: {
  messages: Partial<BygghjalpenMessage>[];
}) => {
  const now = new Date('2026-06-17T12:00:00.000Z');
  const chatRepository = {
    create: jest.fn((chat) => ({
      ...chat,
      id: 'chat-1',
      createdAt: now,
      updatedAt: now,
    })),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(async (chat) => ({
      ...chat,
      id: chat.id ?? 'chat-1',
      createdAt: chat.createdAt ?? now,
      updatedAt: chat.updatedAt ?? now,
    })),
    update: jest.fn(),
  };
  const messageRepository = {
    find: jest.fn(async () => [...messages].reverse()),
    save: jest.fn(async (message) => {
      const savedMessage = {
        ...message,
        id: message.id ?? `message-${messages.length + 1}`,
        createdAt: message.createdAt ?? now,
      };
      messages.push(savedMessage);
      return savedMessage;
    }),
  };
  const productRepository = {
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };
  const fileService = { getUrl: jest.fn() };

  return new BygghjalpenService(
    chatRepository as unknown as ConstructorParameters<
      typeof BygghjalpenService
    >[0],
    messageRepository as unknown as ConstructorParameters<
      typeof BygghjalpenService
    >[1],
    productRepository as unknown as ConstructorParameters<
      typeof BygghjalpenService
    >[2],
    fileService as unknown as ConstructorParameters<
      typeof BygghjalpenService
    >[3],
  );
};

const createMessage = (
  id: string,
  role: BygghjalpenMessageRole,
  content: string,
  status = BygghjalpenMessageStatus.COMPLETE,
): Partial<BygghjalpenMessage> => ({
  id,
  role,
  status,
  content,
  chatId: 'chat-1',
  createdAt: new Date('2026-06-17T12:00:00.000Z'),
});

const createTextStream = async function* (chunks: string[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
};

const createResponse = () => {
  const response = {
    destroyed: false,
    writableEnded: false,
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write: jest.fn(),
    end: jest.fn(function (this: { writableEnded: boolean }) {
      this.writableEnded = true;
    }),
  };

  return response as unknown as Response;
};
