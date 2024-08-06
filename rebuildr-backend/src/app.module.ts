import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './ormconfig';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DataloaderService } from './dataloader/dataloader.service';
import { DataloaderModule } from './dataloader/dataloader.module';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './auth/constants';
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
import { RefreshToken } from './entities/refreshToken.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local.1p'],
    }),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
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
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule, ConfigModule],
      inject: [DataloaderService, ConfigService],
      useFactory: (
        dataloaderService: DataloaderService,
        configService: ConfigService,
      ) => {
        const isProd = configService.get('NODE_ENV') === 'production';
        return {
          debug: !isProd,
          playground: !isProd,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          context: () => ({
            loaders: dataloaderService.createLoaders(),
          }),
        };
      },
    }),
  ],
  controllers: [AppController],
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
  ],
})
export class AppModule {}
