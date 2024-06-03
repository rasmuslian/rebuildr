import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './ormconfig';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DataloaderService } from './dataloader/dataloader.service';
import { DataloaderModule } from './dataloader/dataloader.module';

const isProd = process.env.NODE_ENV === 'production';


@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule],
      inject: [DataloaderService],
      useFactory: (dataloaderService: DataloaderService) => {
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
  providers: [AppService],
})
export class AppModule {}
