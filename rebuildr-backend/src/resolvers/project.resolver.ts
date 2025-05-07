import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
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

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => Project)
  @UseGuards(GqlAuthGuard)
  async getProject(@Args('input') input: GetProjectInput) {
    return this.projectService.findOne(input);
  }

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async myProjects(@CurrentUser() user: AuthedUserType) {
    return this.projectService.findMany({ userId: user.id });
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
}
