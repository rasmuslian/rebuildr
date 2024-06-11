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
import { AppResolver } from './resolvers/App.resolver';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local.1p'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dbConfig(configService),
      }),
    }),
    TypeOrmModule.forFeature([User]),
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
  providers: [AppService, AppResolver, AuthResolver, AuthService, UserService],
})
export class AppModule {}
