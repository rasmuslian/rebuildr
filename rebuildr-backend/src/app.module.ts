import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './ormconfig';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DataloaderModule } from './dataloaders/dataloader.module';
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
import { ProductLoader } from './dataloaders/product.loader';
import { CategoryLoader } from './dataloaders/category.loader';
import { RockerService } from './services/rocker.service';
import { RockerAPI } from './apis/rocker.api';
import { CacheModule } from '@nestjs/cache-manager';
import { RockerResolver } from './resolvers/rocker.resolver';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './services/purchase.service';
import { RockerWebhookController } from './controllers/rocker-webhook.controller';
import { PurchaseResolver } from './resolvers/purchase.resolver';
import { EnvironmentVariables, validateConfig } from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { Brand } from './entities/brand.entity';
import { WinstonModule } from 'nest-winston';
import { instanceLogger } from './winston.logger';
import { CategoryTree } from './entities/category-tree.entity';
import { BrandService } from './services/brand.service';
import { BrandResolver } from './resolvers/brand.resolver';
import { ProjectService } from './services/project.service';
import { ProjectResolver } from './resolvers/project.resolver';
import { Project } from './entities/project.entity';
import { UserLoader } from './dataloaders/user.loader';
import { ShippingPrice } from './entities/shipping-price.entity';
import { ShippingPriceResolver } from './resolvers/shipping-price.resolver';
import { ShippingPriceService } from './services/shipping-price.service';

export interface RequestType {
  user?: AuthedUserType;
  [key: string]: unknown;
}

@Module({
  imports: [
    WinstonModule.forRoot(instanceLogger),
    ConfigModule.forRoot({
      envFilePath: ['.env.local.1p'],
      validate: validateConfig,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: jwtConstants.expiresIn },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        ...dbConfig(configService),
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Product,
      Category,
      CategoryTree,
      Message,
      File,
      RefreshToken,
      Event,
      Purchase,
      Brand,
      Project,
      ShippingPrice,
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, ConfigModule],
      inject: [ProductLoader, CategoryLoader, UserLoader, ConfigService],
      useFactory: (
        productLoaderService: ProductLoader,
        categoryLoaderService: CategoryLoader,
        userLoaderService: UserLoader,
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        const isProd = configService.get('NODE_ENV') === 'production';
        return {
          debug: !isProd,
          playground: !isProd,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          context: ({ req, res }) => ({
            productLoaders: productLoaderService.createLoaders(),
            categoryLoaders: categoryLoaderService.createLoaders(),
            userLoaders: userLoaderService.createLoaders(),
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
    ScheduleModule.forRoot(),
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
    BrandService,
    BrandResolver,
    ProjectService,
    ProjectResolver,
    ShippingPriceResolver,
    ShippingPriceService,
  ],
})
export class AppModule {}
