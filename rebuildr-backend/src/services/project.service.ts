import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import {
  CreateProjectInput,
  GetProjectInput,
  UpdateProjectInput,
} from 'src/resolvers/project.resolver';
import { Repository } from 'typeorm';
import { GeocodingService } from './geocoding.service';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';

export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private geocodingService: GeocodingService,
  ) {}

  async findOne(input: GetProjectInput) {
    return await this.projectRepository.findOne({
      where: { id: input.id },
    });
  }

  async findMany(input: { userId: string }) {
    return await this.projectRepository.find({
      where: {
        userId: input.userId,
      },
      order: { createdAt: 'DESC' },
    });
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
}
