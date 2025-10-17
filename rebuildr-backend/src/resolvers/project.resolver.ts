import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Root,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Project } from 'src/entities/project.entity';
import { ProjectService } from 'src/services/project.service';
import {
  LocationResponse,
  LocationInputType,
  ApproximatePlaceResponse,
} from './geocoding.resolver';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType } from 'src/auth/constants';
import { Product } from 'src/entities/product.entity';
import { IProjectLoaders } from 'src/dataloaders/project.loader';
import { File } from 'src/entities/file.entity';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { User } from 'src/entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';

@InputType()
export class GetProjectInput {
  @Field()
  id: string;
}

@InputType()
export class CreateProjectInput {
  @Field()
  title: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => LocationInputType)
  location: LocationInputType;
  @Field({ nullable: true })
  contactName?: string;
  @Field({ nullable: true })
  contactEmail?: string;
  @Field({ nullable: true })
  contactPhone?: string;
}

@InputType()
export class UpdateProjectInput {
  @Field()
  id: string;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => LocationInputType, { nullable: true })
  location?: LocationInputType;
  @Field({ nullable: true })
  contactName?: string;
  @Field({ nullable: true })
  contactEmail?: string;
  @Field({ nullable: true })
  contactPhone?: string;
}

@InputType()
export class SetLikeProjectInput {
  @Field()
  id: string;

  @Field()
  like: boolean;
}

@InputType()
export class CmsListProjectsInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  searchString?: string;
}

@ObjectType()
export class CmsListProjectsResponse {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => Int)
  total: number;
}

@InputType()
class CmsBaseProjectInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  address: string;

  @Field({ nullable: true })
  contactName?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;
}

@InputType()
export class CmsCreateProjectInput extends CmsBaseProjectInput {}

@InputType()
export class CmsUpdateProjectInput extends CmsBaseProjectInput {
  @Field(() => String)
  id: string;
}

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => Project)
  async getProject(@Args('input') input: GetProjectInput) {
    return this.projectService.findOne(input);
  }

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async myProjects(@CurrentUser() user: AuthedUserType) {
    return this.projectService.findMany({ userId: user.id });
  }

  @Query(() => CmsListProjectsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListProjects(
    @Args('input') input: CmsListProjectsInput,
  ): Promise<CmsListProjectsResponse> {
    return this.projectService.cmsListProjects(input);
  }

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsGetUserProjects(
    @CurrentUser() user: AuthedUserType,
    @Args('sellerId', { nullable: true }) sellerId?: string,
  ): Promise<Project[]> {
    const userId = sellerId ?? user.id;
    return this.projectService.cmsGetUserProjects(userId);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateProject(
    @Args('input') input: CmsCreateProjectInput,
    @CurrentUser() _user: AuthedUserType,
  ): Promise<Project> {
    return this.projectService.cmsCreateProject(input, _user.id);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateProject(
    @Args('input') input: CmsUpdateProjectInput,
  ): Promise<Project> {
    return this.projectService.cmsUpdateProject(input);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.projectService.create(input, user.id);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async updateProject(
    @Args('input') input: UpdateProjectInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.projectService.update(input, user.id);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async setLikeProject(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: SetLikeProjectInput,
  ) {
    return this.projectService.setLikeProject(user.id, input);
  }

  @ResolveField(() => Boolean, { nullable: true })
  @UseGuards(GqlOptionalAuthGuard)
  async likedByMe(
    @Root() project: Project,
    @Context('projectLoaders') projectLoaders: IProjectLoaders,
    @CurrentUser() user?: AuthedUserType,
  ) {
    if (!user) {
      return null;
    }

    return projectLoaders.likedByUserLoader.load({
      projectId: project.id,
      userId: user.id,
    });
  }

  @ResolveField(() => LocationResponse)
  async location(@Parent() project: Project) {
    return {
      lat: project.addressLocation.coordinates[0],
      lng: project.addressLocation.coordinates[1],
    };
  }

  @ResolveField(() => ApproximatePlaceResponse)
  async approximatePlace(@Parent() project: Project) {
    return this.projectService.approximatePlace(project);
  }

  @ResolveField(() => [Product])
  async products(
    @Args('searchString', { nullable: true })
    searchString: string | undefined,
    @Parent() project: Project,
    @Context('projectLoaders') projectLoaders: IProjectLoaders,
  ) {
    return await projectLoaders.productsLoader.load({
      projectId: project.id,
      searchString,
    });
  }

  @ResolveField(() => File, { nullable: true })
  async projectPicture(
    @Parent() project: Project,
    @Context('projectLoaders') projectLoaders: IProjectLoaders,
  ) {
    if (!project.projectPictureId) {
      return null;
    }
    return await projectLoaders.projectPictureLoader.load(project.id);
  }

  @ResolveField(() => User)
  async user(
    @Parent() project: Project,
    @Context('projectLoaders') projectLoaders: IProjectLoaders,
  ) {
    return await projectLoaders.userLoader.load(project.id);
  }
}
