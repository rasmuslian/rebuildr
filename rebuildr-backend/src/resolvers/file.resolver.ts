import {
  Parent,
  ResolveField,
  Resolver,
  Query,
  InputType,
  Field,
  Int,
  Args,
  ObjectType,
  Mutation,
} from '@nestjs/graphql';
import { FileService } from 'src/services/file.service';
import { File } from 'src/entities/file.entity';
import { FileInputType } from './product.resolver';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoleEnum } from 'src/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';

@InputType()
export class CmsListImagesInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;
}

@ObjectType()
export class CmsListImagesResponse {
  @Field(() => [File])
  files: File[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class CmsUploadFileInput {
  @Field(() => [FileInputType], { nullable: true })
  images?: FileInputType[];
}
@ObjectType()
export class CmsUploadFileResponse {
  @Field(() => [String])
  presignedPutUrls: string[];
}

@Resolver(() => File)
export class FileResolver {
  constructor(private fileService: FileService) {}

  @ResolveField(() => String)
  async url(@Parent() file: File) {
    return this.fileService.getUrl(file);
  }

  @Mutation(() => CmsUploadFileResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUploadFiles(
    @Args('input') input: CmsUploadFileInput,
  ): Promise<CmsUploadFileResponse> {
    return this.fileService.cmsUploadFile(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeleteFile(@Args('imageId') imageId: string) {
    return this.fileService.cmsDeleteFile(imageId);
  }

  @Query(() => CmsListImagesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListImages(
    @Args('input') input: CmsListImagesInput,
  ): Promise<CmsListImagesResponse> {
    return await this.fileService.cmsListImages(input);
  }
}
