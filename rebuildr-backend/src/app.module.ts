import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './ormconfig';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DataloaderModule } from './dataloader/dataloader.module';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthedUserType, jwtConstants } from './auth/constants';
import { JwtStrategy } from './auth/jwt.strategy';
import { UserResolver } from './resolvers/user.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { CategoryResolver } from './resolvers/category.resolver';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Message } from './entities/message.entity';
import { MessageResolver } from './resolvers/message.resolver';
import { MessageService } from './services/message.service';
import { GeocodingService } from './services/geocoding.service';
import { FileService } from './services/file.service';
import { File } from './entities/file.entity';
import { FileResolver } from './resolvers/file.resolver';
import { RefreshToken } from './entities/refresh-token.entity';
import { CaslAbilityFactory } from './casl/casl-ability.factory';
import { GqlOptionalAuthGuard } from './auth/gql-optional-auth.guard';
import { MailService } from './services/mail.service';
import { RolesGuard } from './auth/roles.guard';
import { GeocodingResolver } from './resolvers/geocoding.resolver';
import { Event } from './entities/event.entity';
import { EventService } from './services/event.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';
import { ProductLoader } from './dataloader/product.loader';
import { CategoryLoader } from './dataloader/category.loader';
import { RockerService } from './services/rocker.service';
import { RockerAPI } from './apis/rocker.api';
import { CacheModule } from '@nestjs/cache-manager';
import { RockerResolver } from './resolvers/rocker.resolver';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './services/purchase.service';
import { RockerWebhookController } from './controllers/rocker-webhook.controller';
import { PurchaseResolver } from './resolvers/purchase.resolver';
import { CustomLogger } from './custom.logger';

export type RequestType = {
  user?: AuthedUserType;
  [key: string]: any;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local.1p'],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: jwtConstants.expiresIn },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dbConfig(configService),
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Product,
      Category,
      Message,
      File,
      RefreshToken,
      Event,
      Purchase,
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, ConfigModule],
      inject: [ProductLoader, CategoryLoader, ConfigService],
      useFactory: (
        productLoaderService: ProductLoader,
        categoryLoaderService: CategoryLoader,
        configService: ConfigService,
      ) => {
        const isProd = configService.get('NODE_ENV') === 'production';
        return {
          debug: !isProd,
          playground: !isProd,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          context: ({ req, res }) => ({
            productLoaders: productLoaderService.createLoaders(),
            categoryLoaders: categoryLoaderService.createLoaders(),
            req,
            res,
          }),
          hideSchemaDetailsFromClientErrors: isProd,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 2,
      },
    ]),
    CacheModule.register(),
  ],
  controllers: [AppController, RockerWebhookController],
  providers: [
    JwtStrategy,
    AppService,
    AuthResolver,
    AuthService,
    UserResolver,
    UserService,
    ProductResolver,
    ProductService,
    CategoryResolver,
    CategoryService,
    MessageResolver,
    MessageService,
    GeocodingService,
    FileResolver,
    FileService,
    CaslAbilityFactory,
    GqlOptionalAuthGuard,
    MailService,
    RolesGuard,
    GeocodingResolver,
    EventService,
    GqlThrottlerGuard,
    RockerResolver,
    RockerService,
    RockerAPI,
    PurchaseService,
    PurchaseResolver,
    CustomLogger,
  ],
})
export class AppModule {}
