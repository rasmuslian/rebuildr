import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { FileService } from 'src/services/file.service';
import { File } from 'src/entities/file.entity';

@Resolver(() => File)
export class FileResolver {
  constructor(private fileService: FileService) {}

  @ResolveField(() => String)
  async presignedGetUrl(@Root() _file: File) {
    return this.fileService.getPresignedGetUrl(_file.id);
  }
}
