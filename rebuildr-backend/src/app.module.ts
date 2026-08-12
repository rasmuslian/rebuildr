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
import { OrganizationService } from './services/organization.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  AuthedUserType,
  authThrottleConfig,
  jwtConstants,
} from './auth/constants';
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
import { SearchSuggestionResolver } from './resolvers/search-suggestion.resolver';
import { SearchSuggestionService } from './services/search-suggestion.service';
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
import { FooterSectionLoader } from './dataloaders/footer-section.loader';
import { FooterSectionEntry } from './entities/footer-section-entry.entity';
import { FooterSectionEntryService } from './services/footer-section-entry.service';
import { FooterSectionEntryResolver } from './resolvers/footer-section-entry.resolver';
import { StripWebhookController } from './controllers/stripe-webhook.controller';
import { StripeService } from './services/stripe.service';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { MessageLoader } from './dataloaders/message.loader';
import { MapPinService } from './services/map-pin.service';
import { MapPin } from './entities/map-pin.entity';
import { MapPinResolver } from './resolvers/map-pin.resolver';
import { ProductSubscriber } from './subscribers/product.subscriber';
import { ProjectSubscriber } from './subscribers/project.subscriber';
import { StripeResolver } from './resolvers/stripe.resolver';
import { S3Service } from './services/s3.service';
import { ImageVariantService } from './services/image-variant.service';
import { MailResolver } from './resolvers/mail.resolver';
import { Partner } from './entities/partner.entity';
import { PartnerLoader } from './dataloaders/partner.loader';
import { PartnerService } from './services/partner.service';
import { PartnerResolver } from './resolvers/partner.resolver';
import { BrandLoader } from './dataloaders/brand.loader';
import { CO2Factor } from './entities/co2-factor.entity';
import { CO2FactorService } from './services/co2-factor.service';
import { BoverketAPI } from './apis/boverket.api';
import { CO2FactorResolver } from './resolvers/co2-factor.resolver';
import { PageContent } from './entities/page-content.entity';
import { PageContentService } from './services/page-content.service';
import { PageContentResolver } from './resolvers/page-content.resolver';
import { AIService } from './services/ai.service';
import { Banner } from './entities/banner.entity';
import { BannerService } from './services/banner.service';
import { BannerResolver } from './resolvers/banner.resolver';
import { BannerLoader } from './dataloaders/banner.loader';
import { NewsletterCompetition } from './entities/newsletter-competition.entity';
import { NewsletterCompetitionService } from './services/newsletter-competition.service';
import { NewsletterCompetitionResolver } from './resolvers/newsletter-competition.resolver';
import { Conversation } from './entities/conversation.entity';
import { ConversationLoader } from './dataloaders/conversation.loader';
import { ConversationResolver } from './resolvers/conversation.resolver';
import { ConversationService } from './services/conversation.service';
import { StatisticsResolver } from './resolvers/statistics.resolver';
import { StatisticsService } from './services/statistics.service';
import { AterbyggarenChat } from './entities/aterbyggaren-chat.entity';
import { AterbyggarenMessage } from './entities/aterbyggaren-message.entity';
import { AterbyggarenController } from './controllers/aterbyggaren.controller';
import { AterbyggarenService } from './services/aterbyggaren.service';
import { BankIDResolver } from './resolvers/bankid.resolver';
import { BankIDService } from './services/bankid.service';
import { Identity } from './entities/identity.entity';
import { SearchEnrichmentService } from './services/search-enrichment.service';
import { CreditsafeAPI } from './apis/creditsafe.api';
import { CreditsafeService } from './services/creditsafe.service';
import { CategoryImageService } from './services/category-image.service';

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
      Conversation,
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
      FooterSectionEntry,
      MapPin,
      Partner,
      CO2Factor,
      PageContent,
      Banner,
      NewsletterCompetition,
      AterbyggarenChat,
      AterbyggarenMessage,
      Identity,
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
        ConversationLoader,
        PartnerLoader,
        BrandLoader,
        BannerLoader,
        FooterSectionLoader,
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
        conversationLoaderService: ConversationLoader,
        partnerLoaderService: PartnerLoader,
        brandLoaderService: BrandLoader,
        bannerLoaderService: BannerLoader,
        footerSectionLoaderService: FooterSectionLoader,
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
            conversationLoaders: conversationLoaderService.createLoaders(),
            partnerLoaders: partnerLoaderService.createLoaders(),
            brandLoaders: brandLoaderService.createLoaders(),
            bannerLoaders: bannerLoaderService.createLoaders(),
            footerSectionLoaders: footerSectionLoaderService.createLoaders(),
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
      {
        name: 'auth',
        ttl: authThrottleConfig.ttl,
        limit: authThrottleConfig.limit,
      },
    ]),
    CacheModule.register(),
    ScheduleModule.forRoot(),
  ],
  controllers: [StripWebhookController, AterbyggarenController],
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
    OrganizationService,
    ProductResolver,
    ProductService,
    CategoryResolver,
    CategoryService,
    CategoryImageService,
    MessageResolver,
    MessageService,
    ConversationResolver,
    ConversationService,
    GeocodingService,
    FileResolver,
    FileService,
    GqlOptionalAuthGuard,
    MailResolver,
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
    SearchSuggestionService,
    SearchSuggestionResolver,
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
    FooterSectionEntryService,
    FooterSectionEntryResolver,
    StripeService,
    MapPinService,
    MapPinResolver,
    ProductSubscriber,
    ProjectSubscriber,
    StripeResolver,
    S3Service,
    ImageVariantService,
    PartnerService,
    PartnerResolver,
    CO2FactorService,
    CO2FactorResolver,
    BoverketAPI,
    PageContentService,
    PageContentResolver,
    AIService,
    BannerService,
    BannerResolver,
    NewsletterCompetitionService,
    NewsletterCompetitionResolver,
    StatisticsResolver,
    StatisticsService,
    AterbyggarenService,
    BankIDResolver,
    BankIDService,
    SearchEnrichmentService,
    CreditsafeAPI,
    CreditsafeService,
  ],
})
export class AppModule {}
