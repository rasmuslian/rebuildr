import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FileService } from 'src/services/file.service';
import { File } from 'src/entities/file.entity';

@Resolver(() => File)
export class FileResolver {
  constructor(private fileService: FileService) {}

  @ResolveField(() => String)
  async url(@Parent() file: File) {
    return this.fileService.getUrl(file);
  }
}
