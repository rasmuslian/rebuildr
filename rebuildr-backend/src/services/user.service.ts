import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import {
  RegistrationStatusEnum,
  User,
  UserRoleEnum,
  UserType,
} from 'src/entities/user.entity';
import {
  BadFieldsInputException,
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
} from 'src/exceptions';
import { Repository } from 'typeorm';
import { GeocodingService } from './geocoding.service';
import {
  CreateOrganizationUserInput,
  UpdateUserInput,
} from 'src/resolvers/user.resolver';
import { RockerService } from './rocker.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private caslAbilityFactory: CaslAbilityFactory,
    private rockerService: RockerService,
  ) {}

  async findOne(id: string) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async getRegistrationStatus(user: User) {
    if (user.type === UserType.BUSINESS) {
      return RegistrationStatusEnum.DONE;
    }
    if (!user?.emailVerifiedAt) {
      return RegistrationStatusEnum.EMAIL;
    }
    if (!user.username) {
      return RegistrationStatusEnum.DETAILS;
    }

    return RegistrationStatusEnum.DONE;
  }

  async update(input: UpdateUserInput, requesterId: string) {
    const user = await this.userRepository.findOneBy({ id: input.id });
    const requester = await this.userRepository.findOneBy({ id: requesterId });

    if (!user || !requester) {
      throw BadUserInputException();
    }
    if (requester.role !== UserRoleEnum.ADMIN && requester.id !== input.id) {
      throw ForbiddenException();
    }

    if (input.address) {
      user.address = input.address;
      const location = await this.geocodingService.addressToLocation(
        input.address,
      );

      user.addressLocation = {
        type: 'Point',
        coordinates: [location.lat, location.lng],
      };
    }

    return await this.userRepository.save(user);
  }

  /**
   *
   * @param input
   * @param input.type The type of the organization: UserType.BUSINESS | UserType.NONPROFIT
   * @param input.organizationNumber The organization number
   * @param input.username The name of the organization
   * @param input.creatorId The ID of the personal account user creating the organization
   * @returns The created organization user
   */

  async createOrganizationUser(input: CreateOrganizationUserInput) {
    const creator = await this.userRepository.findOne({
      where: { id: input.creatorId },
      relations: { organizations: true },
    });
    if (!creator) {
      throw BadUserInputException('Creator not found');
    }
    const organizationExist = await this.organizationExists(
      input.organizationNumber,
    );
    if (organizationExist) {
      throw BadFieldsInputException([
        {
          message:
            'An organization with given organization number already exist',
          name: 'organizationNumber',
        },
      ]);
    }
    //verify org number
    const onlyDigits = input.organizationNumber.replace(/\D/g, '');
    if (onlyDigits.length !== 10) {
      throw BadFieldsInputException([
        { message: 'Invalid organization number', name: 'organizationNumber' },
      ]);
    }
    const organizationNumber = onlyDigits;

    const organizationUser = new User();
    organizationUser.organizationNumber = organizationNumber;
    organizationUser.username = input.organizationName;

    creator.organizations = creator.organizations || [];
    creator.organizations.push(organizationUser);

    try {
      const rockerResponse = await this.rockerService.createOrganizationUser(
        organizationUser,
        creator,
      );
      organizationUser.rockerUserId = rockerResponse.id;
    } catch (e) {
      console.log(e);
      throw InternalServerException('Failure when creating organization');
    }

    const _creator = await this.userRepository.save(creator);
    organizationUser.organizationUsers = [_creator];
    const _organizationUser = await this.userRepository.save(organizationUser);
    return _organizationUser;
  }

  async organizationExists(organizationNumber: string) {
    return !!(await this.userRepository.findOne({
      where: { organizationNumber },
    }));
  }
}
