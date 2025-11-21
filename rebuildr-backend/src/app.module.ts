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
import { MailchimpService } from './services/mailchimp.service';
import { RolesGuard } from './auth/roles.guard';
import { GeocodingResolver } from './resolvers/geocoding.resolver';
import { Event } from './entities/event.entity';
import { EventService } from './services/event.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';
import { ProductLoader } from './dataloaders/product.loader';
import { CategoryLoader } from './dataloaders/category.loader';
import { CacheModule } from '@nestjs/cache-manager';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './services/purchase.service';
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
import { SearchResult } from './entities/search-result.entity';
import { SearchResultLoader } from './dataloaders/search-result.loader';
import { SearchResultService } from './services/search-result.service';
import { SearchResultResolver } from './resolvers/search-result.resolver';
import { Review } from './entities/review.entity';
import { ProjectLoader } from './dataloaders/project.loader';
import { ReviewLoader } from './dataloaders/review.loader';
import { ReviewResolver } from './resolvers/review.resolver';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ShippingResolver } from './resolvers/shipping.resolver';
import { ShippingService } from './services/shipping.service';
import { PostnordAPI } from './apis/postnord.api';
import { PurchaseLoader } from './dataloaders/purchase.loader';
import { DHLAPI } from './apis/dhl.api';
import { SystemMessagesService } from './services/system-messages.service';
import { PostnordService } from './services/postnord.service';
import { ReviewService } from './services/review.service';
import { ReportPurchaseResolver } from './resolvers/report-purchase.resolver';
import { ReportPurchaseService } from './services/report-purchase.service';
import { ReportPurchase } from './entities/report-purchase.entity';
import { ReportProductResolver } from './resolvers/report-product.resolver';
import { ReportProductService } from './services/report-product.service';
import { ReportProduct } from './entities/report-product.entity';
import { Article } from './entities/article.entity';
import { ArticleResolver } from './resolvers/article.resolver';
import { ArticleService } from './services/article.service';
import { FooterSection } from './entities/footer-section.entity';
import { FooterSectionResolver } from './resolvers/footer-section.resolver';
import { FooterSectionService } from './services/footer-section.service';
import { ArticleFooterSection } from './entities/article-footer-section.entity';
import { ArticleFooerSectionService } from './services/article-footer-section.service';
import { ArticleFooterSectionResolver } from './resolvers/article-footer-section.resolver';
import { StripWebhookController } from './controllers/stripe-webhook.controller';
import { StripeService } from './services/stripe.service';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { MessageLoader } from './dataloaders/message.loader';
import { MapPinService } from './services/map-pin.service';
import { MapPin } from './entities/map-pin.entity';
import { MapPinLoader } from './dataloaders/map-pin.loader';
import { MapPinResolver } from './resolvers/map-pin.resolver';
import { ProductSubscriber } from './subscribers/product.subscriber';

export interface RequestType {
  user?: AuthedUserType;
  [key: string]: unknown;
}

@Module({
  imports: [
    SentryModule.forRoot(),
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
      SearchResult,
      Review,
      ReportPurchase,
      ReportProduct,
      Article,
      FooterSection,
      ArticleFooterSection,
      MapPin,
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, ConfigModule],
      inject: [
        ProductLoader,
        CategoryLoader,
        UserLoader,
        SearchResultLoader,
        ProjectLoader,
        ReviewLoader,
        PurchaseLoader,
        MessageLoader,
        MapPinLoader,
        ConfigService,
      ],
      useFactory: (
        productLoaderService: ProductLoader,
        categoryLoaderService: CategoryLoader,
        userLoaderService: UserLoader,
        searchResultLoaderService: SearchResultLoader,
        projectLoaderService: ProjectLoader,
        reviewLoaderService: ReviewLoader,
        purchaseLoaderService: PurchaseLoader,
        messageLoaderService: MessageLoader,
        mapPinLoaderService: MapPinLoader,
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        const isProd = configService.get('NODE_ENV') === 'production';
        return {
          debug: !isProd,
          playground: false,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          context: ({ req, res }) => ({
            productLoaders: productLoaderService.createLoaders(),
            categoryLoaders: categoryLoaderService.createLoaders(),
            userLoaders: userLoaderService.createLoaders(),
            searchResultLoaders: searchResultLoaderService.createLoaders(),
            projectLoaders: projectLoaderService.createLoaders(),
            reviewLoaders: reviewLoaderService.createLoaders(),
            purchaseLoaders: purchaseLoaderService.createLoaders(),
            messageLoaders: messageLoaderService.createLoaders(),
            mapPinLoaders: mapPinLoaderService.createLoaders(),
            req,
            res,
          }),
          hideSchemaDetailsFromClientErrors: isProd,
          plugins: [
            isProd
              ? ApolloServerPluginLandingPageProductionDefault()
              : ApolloServerPluginLandingPageLocalDefault(),
          ],
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
  controllers: [StripWebhookController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
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
    MailchimpService,
    RolesGuard,
    GeocodingResolver,
    EventService,
    GqlThrottlerGuard,
    PostnordAPI,
    DHLAPI,
    PurchaseService,
    PurchaseResolver,
    BrandService,
    BrandResolver,
    ProjectService,
    ProjectResolver,
    ShippingPriceResolver,
    ShippingPriceService,
    SearchResultService,
    SearchResultResolver,
    ReviewResolver,
    ReviewService,
    ShippingResolver,
    ShippingService,
    SystemMessagesService,
    PostnordService,
    ReportPurchaseResolver,
    ReportPurchaseService,
    ReportProductResolver,
    ReportProductService,
    ArticleResolver,
    ArticleService,
    FooterSectionResolver,
    FooterSectionService,
    ArticleFooerSectionService,
    ArticleFooterSectionResolver,
    StripeService,
    MapPinService,
    MapPinResolver,
    ProductSubscriber,
  ],
})
export class AppModule {}
