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
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoleEnum } from 'src/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { FileType } from 'src/constants/enums';

@InputType()
export class FileInputType {
  @Field(() => String)
  mimeType: string;

  @Field(() => String, { nullable: true })
  name?: string;
}
@InputType()
export class CmsListFilesInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => FileType)
  fileType: FileType;

  @Field(() => String, { nullable: true })
  searchString?: string;
}

@ObjectType()
export class CmsListFilesResponse {
  @Field(() => [File])
  files: File[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class CmsCreateFilesInput {
  @Field(() => [FileInputType], { nullable: true })
  files?: FileInputType[];
}
@ObjectType()
export class CmsCreateFilesResponse {
  @Field(() => [String])
  presignedPutUrls: string[];
}

@Resolver(() => File)
export class FileResolver {
  constructor(private fileService: FileService) {}

  // Pass `width` to get a size-appropriate WebP variant (when one has been
  // generated) instead of the original — e.g. `url(width: 200)` for grids.
  // Falls back to the original URL, so callers can always render the result.
  @ResolveField(() => String)
  async url(
    @Parent() file: File,
    @Args('width', { type: () => Int, nullable: true }) width?: number,
  ) {
    return this.fileService.getUrl(file, width);
  }

  @Mutation(() => CmsCreateFilesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateFiles(
    @Args('input') input: CmsCreateFilesInput,
  ): Promise<CmsCreateFilesResponse> {
    return this.fileService.cmsCreateFiles(input);
  }

  @Mutation(() => File)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeleteFile(@Args('id') id: string) {
    return this.fileService.cmsDeleteFile(id);
  }

  @Query(() => CmsListFilesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListFiles(
    @Args('input') input: CmsListFilesInput,
  ): Promise<CmsListFilesResponse> {
    return await this.fileService.cmsListFiles(input);
  }
}
