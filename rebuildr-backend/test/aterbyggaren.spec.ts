import { generateText, streamText } from 'ai';
import { EventEmitter } from 'events';
import { Request, Response } from 'express';

import {
  AterbyggarenMessage,
  AterbyggarenMessageRole,
  AterbyggarenMessageStatus,
} from 'src/entities/aterbyggaren-message.entity';
import {
  Product,
  ProductConditionEnum,
  ProductStatus,
} from 'src/entities/product.entity';
import { OrderProductsEnum } from 'src/resolvers/product.resolver';
import { UserRoleEnum } from 'src/entities/user.entity';
import { AterbyggarenService } from 'src/services/aterbyggaren.service';

type GetContextMessages = (
  chatId: string,
  currentUserMessageId?: string,
) => Promise<{ role: string; content: string }[]>;

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => jest.fn(() => 'gemini-model')),
}));

jest.mock('ai', () => ({
  Output: {
    object: jest.fn((config) => config),
  },
  generateText: jest.fn(),
  streamText: jest.fn(),
  stepCountIs: jest.fn((stepCount: number) => ({ stepCount })),
  tool: jest.fn((config) => config),
}));

const mockGenerateText = jest.mocked(generateText);
const mockStreamText = jest.mocked(streamText);

describe('AterbyggarenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateText.mockResolvedValue({
      output: { title: 'Planera gipsvägg' },
    } as unknown as Awaited<ReturnType<typeof generateText>>);
  });

  it('creates a material-list draft without requiring a confirmation ritual', () => {
    const service = createService({ messages: [] });
    const systemPrompt = Reflect.get(service, 'systemPrompt') as string;

    expect(systemPrompt).toContain('Ställ högst två frågor per tur');
    expect(systemPrompt).toContain('skapa Materiallistan direkt');
    expect(systemPrompt).toContain('Ställ aldrig en separat bekräftelsefråga');
    expect(systemPrompt).toContain('nyprisSek::återbruksprisSek');
    expect(systemPrompt).toContain('Klimatkvittots A1-A3-metodik');
  });

  it('does not allow references to external marketplaces or competitors', () => {
    const service = createService({ messages: [] });
    const systemPrompt = Reflect.get(service, 'systemPrompt') as string;

    expect(systemPrompt).toContain(
      'Nämn, rekommendera eller hänvisa inte till externa marknadsplatser eller konkurrenter',
    );
  });

  it('excludes incomplete previous turns from the next model context', async () => {
    const messages = [
      createMessage(
        'user-complete',
        AterbyggarenMessageRole.USER,
        'Första frågan',
      ),
      createMessage(
        'assistant-complete',
        AterbyggarenMessageRole.ASSISTANT,
        'Första svaret',
      ),
      createMessage(
        'user-interrupted',
        AterbyggarenMessageRole.USER,
        'Frågan som avbröts',
      ),
      createMessage(
        'assistant-interrupted',
        AterbyggarenMessageRole.ASSISTANT,
        'Halvt svar',
        AterbyggarenMessageStatus.INTERRUPTED,
      ),
      createMessage(
        'user-orphaned',
        AterbyggarenMessageRole.USER,
        'Frågan utan assistentsvar',
      ),
      createMessage(
        'user-current',
        AterbyggarenMessageRole.USER,
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

    const savedMessages: Partial<AterbyggarenMessage>[] = [];
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
      (message) => message.role === AterbyggarenMessageRole.ASSISTANT,
    );

    expect(assistantMessage?.status).toBe(
      AterbyggarenMessageStatus.INTERRUPTED,
    );
    expect(assistantMessage?.content).toContain(
      'Jag nådde längdgränsen för svaret',
    );
    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('event: done'),
    );
  });

  it('keeps the first user message as placeholder and streams a generated short title', async () => {
    mockStreamText.mockReturnValue({
      finishReason: Promise.resolve('stop'),
      textStream: createTextStream(['Börja med att mäta väggen.']),
    } as unknown as ReturnType<typeof streamText>);
    mockGenerateText.mockResolvedValueOnce({
      output: { title: 'Planera gipsvägg' },
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const service = createService({ messages: [] });
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

    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining(
        '"title":"Hur planerar jag materialåtgång för gipsvägg?"',
      ),
    );
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        output: expect.objectContaining({ schema: expect.any(Object) }),
      }),
    );
    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('event: title'),
    );
    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('"title":"Planera gipsvägg"'),
    );
  });

  it('renders an empty product display for an LLM-generated no-results tag', () => {
    const service = createService({ messages: [] });
    const extractProductDisplays = Reflect.get(
      service,
      'extractProductDisplays',
    ) as (content: string, products: Map<string, unknown>) => unknown[];
    const product = createProduct({ id: 'product-trall' });
    const content = [
      '<rebuildr-products ids="product-trall" />',
      '<rebuildr-products ids="" empty="true" />',
    ].join('\n');

    expect(
      extractProductDisplays.call(
        service,
        content,
        new Map([[product.id, product]]),
      ),
    ).toEqual([
      { type: 'products', products: [product] },
      { type: 'products', products: [] },
    ]);
  });

  it('searches products through the shared ranked product search', async () => {
    const exactProduct = createProduct({ id: 'product-exact' });
    const relatedProduct = createProduct({
      id: 'product-related',
      title: 'Relaterad innerdörr',
      category: { name: 'Dörrar' },
      brand: { name: 'Återbruket' },
      images: [{ id: 'image-related' }],
    });
    const productService = {
      findAll: jest.fn(async () => ({
        products: [exactProduct],
        origin: null,
        total: 1,
      })),
      relatedProducts: jest.fn(async () => ({
        products: [relatedProduct],
        origin: null,
        total: 1,
      })),
    };
    const productRepository = {
      find: jest.fn(async () => [
        createProduct({
          id: 'product-exact',
          category: { name: 'Fönster' },
          brand: { name: 'Byggreturen' },
          images: [{ id: 'image-exact' }],
        }),
        relatedProduct,
      ]),
    };
    const fileService = {
      getUrl: jest.fn(
        async (file: { id: string }) =>
          `https://cdn.example.com/${file.id}.jpg`,
      ),
    };
    const service = createService({
      messages: [],
      productRepository,
      productService,
      fileService,
    });
    const searchPublicProducts = Reflect.get(
      service,
      'searchPublicProducts',
    ) as (input: {
      query: string;
      limit?: number;
      maxPrice?: number;
      onlyGiveaways?: boolean;
    }) => Promise<unknown[]>;

    const results = await searchPublicProducts.call(service, {
      query: ' gamla fönster ',
      limit: 3,
      maxPrice: 250,
      onlyGiveaways: true,
    });

    expect(productService.findAll).toHaveBeenCalledWith(
      {
        searchString: 'gamla fönster',
        orderBy: OrderProductsEnum.BEST_MATCH,
        onlyPublished: true,
        maxPrice: 250,
        giveaway: true,
      },
      3,
      0,
      undefined,
    );
    expect(productService.relatedProducts).toHaveBeenCalledWith(
      {
        searchString: 'gamla fönster',
        orderBy: OrderProductsEnum.BEST_MATCH,
        onlyPublished: true,
        maxPrice: 250,
        giveaway: true,
      },
      ['product-exact'],
      2,
      0,
      undefined,
    );
    expect(productRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: {
          images: true,
          category: true,
          brand: true,
          mapPin: true,
          project: { mapPin: true },
        },
        where: expect.objectContaining({ status: ProductStatus.PUBLISHED }),
      }),
    );
    expect(results).toEqual([
      expect.objectContaining({
        id: 'product-exact',
        category: 'Fönster',
        brand: 'Byggreturen',
        imageUrl: 'https://cdn.example.com/image-exact.jpg',
      }),
      expect.objectContaining({
        id: 'product-related',
        category: 'Dörrar',
        brand: 'Återbruket',
        imageUrl: 'https://cdn.example.com/image-related.jpg',
      }),
    ]);
  });
});

const createService = ({
  fileRepository,
  fileService,
  messages,
  productRepository,
  productService,
}: {
  fileRepository?: Partial<
    ConstructorParameters<typeof AterbyggarenService>[2]
  >;
  fileService?: Partial<ConstructorParameters<typeof AterbyggarenService>[5]>;
  messages: Partial<AterbyggarenMessage>[];
  productRepository?: Partial<
    ConstructorParameters<typeof AterbyggarenService>[3]
  >;
  productService?: Partial<
    ConstructorParameters<typeof AterbyggarenService>[4]
  >;
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
  const productRepositoryMock = productRepository ?? {
    find: jest.fn(async () => []),
  };
  const fileRepositoryMock = fileRepository ?? {
    find: jest.fn(async () => []),
    save: jest.fn(),
  };
  const productServiceMock = productService ?? {
    findAll: jest.fn(async () => ({ products: [], origin: null, total: 0 })),
    relatedProducts: jest.fn(async () => ({
      products: [],
      origin: null,
      total: 0,
    })),
  };
  const fileServiceMock = fileService ?? { getUrl: jest.fn() };

  return new AterbyggarenService(
    chatRepository as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[0],
    messageRepository as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[1],
    fileRepositoryMock as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[2],
    productRepositoryMock as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[3],
    productServiceMock as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[4],
    fileServiceMock as unknown as ConstructorParameters<
      typeof AterbyggarenService
    >[5],
  );
};

const createProduct = ({
  id,
  title = 'Gammalt fönster',
  category,
  brand,
  images = [],
}: {
  id: string;
  title?: string;
  category?: { name: string };
  brand?: { name: string };
  images?: { id: string }[];
}): Product =>
  ({
    id,
    title,
    description: 'Beskrivning',
    price: 12000,
    isGiveaway: false,
    condition: ProductConditionEnum.GOOD,
    category,
    brand,
    pickupEnabled: true,
    deliveryEnabled: false,
    images,
    status: ProductStatus.PUBLISHED,
  }) as Product;

const createMessage = (
  id: string,
  role: AterbyggarenMessageRole,
  content: string,
  status = AterbyggarenMessageStatus.COMPLETE,
): Partial<AterbyggarenMessage> => ({
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
