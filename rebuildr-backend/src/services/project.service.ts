import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import {
  CmsCreateProjectInput,
  CmsUpdateProjectInput,
  CmsListProjectsInput,
  CmsListProjectsResponse,
  CreateProjectInput,
  GetProjectInput,
  SetLikeProjectInput,
  UpdateProjectInput,
} from 'src/resolvers/project.resolver';
import { DataSource, Point, Repository, ILike } from 'typeorm';
import { GeocodingService } from './geocoding.service';
import {
  BadUserInputException,
  ForbiddenException,
  NotFoundException,
} from 'src/exceptions';
import { User } from 'src/entities/user.entity';

export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private dataSource: DataSource,
  ) {}

  async findOne(input: GetProjectInput) {
    return await this.projectRepository.findOne({
      where: { id: input.id },
    });
  }

  async findMany(input: { userId?: string; likedByUserIds?: string[] }) {
    const query = this.projectRepository.createQueryBuilder('project');

    if (input.userId) {
      query.andWhere('project.userId = :userId', { userId: input.userId });
    }

    if (input.likedByUserIds && input.likedByUserIds.length > 0) {
      query.innerJoin(
        'project_liked_by_user',
        'plbu',
        'plbu.projectId = project.id',
      );
      query.andWhere('plbu.userId IN (:...likedByUserIds)', {
        likedByUserIds: input.likedByUserIds,
      });
    }

    query.orderBy('project.createdAt', 'DESC');

    return await query.getMany();
  }

  async create(input: CreateProjectInput, currentUserId: string) {
    const existingProjects = await this.projectRepository.find({
      where: { userId: currentUserId },
    });

    if (
      existingProjects.some(
        (p) => p.title.toLowerCase() === input.title.toLowerCase(),
      )
    ) {
      throw BadUserInputException('A project with same title already exists');
    }

    const project = new Project();

    project.title = input.title;
    project.description = input.description;
    project.contactEmail = input.contactEmail;
    project.contactName = input.contactName;
    project.contactPhone = input.contactPhone;
    project.address = (
      await this.geocodingService.locationToAddress(input.location)
    ).address;
    project.addressLocation = {
      type: 'Point',
      coordinates: [input.location.lat, input.location.lng],
    };
    project.userId = currentUserId;

    return await this.projectRepository.save(project);
  }

  async update(input: UpdateProjectInput, currentUserId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: input.id },
    });

    if (!project) {
      throw BadUserInputException('Project not found');
    }
    if (project.userId !== currentUserId) {
      throw ForbiddenException();
    }

    if (input.title !== undefined) {
      project.title = input.title;
    }
    if (input.description !== undefined) {
      project.description = input.description;
    }
    if (input.contactName !== undefined) {
      project.contactName = input.contactName;
    }
    if (input.contactEmail !== undefined) {
      project.contactEmail = input.contactEmail;
    }
    if (input.contactPhone !== undefined) {
      project.contactPhone = input.contactPhone;
    }
    if (input.location) {
      project.address = (
        await this.geocodingService.locationToAddress(input.location)
      ).address;
      project.addressLocation = {
        type: 'Point',
        coordinates: [input.location.lat, input.location.lng],
      };
    }

    return await this.projectRepository.save(project);
  }

  async approximatePlace(project: Project) {
    const approximation = await this.geocodingService.locationToApproximation({
      lat: project.addressLocation.coordinates[0],
      lng: project.addressLocation.coordinates[1],
    });
    const approximateAddress = approximation.address;
    return {
      address: approximateAddress,
      lat: approximation.lat,
      lng: approximation.lng,
    };
  }

  async setLikeProject(
    userId: string,
    { id: projectId, like }: SetLikeProjectInput,
  ) {
    const [project, user] = await Promise.all([
      await this.projectRepository.findOne({
        where: { id: projectId },
        relations: { likedBy: true },
      }),
      await this.userRepository.findOneBy({ id: userId }),
    ]);

    if (!project || !user) {
      throw BadUserInputException();
    }

    //If trying to like and not already liking, add user
    if (
      like &&
      !project.likedBy.some((likedByUser) => likedByUser.id === userId)
    ) {
      project.likedBy.push(user);
    }

    //If removing like, remove the user from the like array
    if (!like) {
      project.likedBy = project.likedBy.filter(
        (likedByUser) => likedByUser.id !== userId,
      );
    }

    return await this.projectRepository.save(project);
  }

  async distanceToProject(locationPoint: Point, projectId: string) {
    const result = await this.dataSource.query(
      'SELECT st_distancesphere("addressLocation", ST_SetSRID(ST_GeomFromGeoJSON($1), ST_SRID("addressLocation"))) as "distance" from project p WHERE p.id = $2',
      [locationPoint, projectId],
    );
    return result[0].distance;
  }

  async cmsListProjects(
    input: CmsListProjectsInput,
  ): Promise<CmsListProjectsResponse> {
    const { pageSize = 10, page = 0, searchString = '' } = input;
    const skip = Math.max(0, pageSize * page);

    const [projects, total] = await this.projectRepository.findAndCount({
      where: [
        {
          title: ILike(`%${searchString}%`),
        },
      ],
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    return {
      projects,
      total,
    };
  }

  async cmsCreateProject(
    input: CmsCreateProjectInput,
    userId: string,
  ): Promise<Project> {
    try {
      const { address, ...rest } = input;
      const location = await this.geocodingService.addressToLocation(address);

      const project = this.projectRepository.create({
        ...rest,
        userId,
        address,
        addressLocation: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
      });

      return this.projectRepository.save(project);
    } catch (error) {
      throw BadUserInputException('Failed to create project' + error);
    }
  }

  async cmsUpdateProject(input: CmsUpdateProjectInput): Promise<Project> {
    const { id, address, ...rest } = input;

    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) throw NotFoundException('Project not found');

    try {
      const location = await this.geocodingService.addressToLocation(address);

      Object.assign<Project, Partial<Project>>(project, {
        ...rest,
        address,
        addressLocation: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
      });

      return this.projectRepository.save(project);
    } catch (error) {
      throw BadUserInputException(`Failed to update project: ${error}`);
    }
  }
}
