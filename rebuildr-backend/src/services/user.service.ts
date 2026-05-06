import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  NotFoundException,
} from 'src/exceptions';
import {
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  Not,
  Repository,
} from 'typeorm';
import { GeocodingService } from './geocoding.service';
import {
  CmsListUsersInput,
  CmsListUsersResponse,
  CmsUpdateUsersInput,
  CreateOrganizationUserInput,
  OrderUsersEnum,
  UpdateOrganizationUserInput,
  UpdateUserInput,
  UsersInput,
} from 'src/resolvers/user.resolver';
import { FileService } from './file.service';
import {
  passwordRegex,
  swedishPhoneNumberRegex,
  swedishPostCodeRegex,
} from 'src/constants/regexp';
import * as z from 'zod';
import * as bcrypt from 'bcrypt';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { RefreshToken } from 'src/entities/refresh-token.entity';
import { StripeService } from './stripe.service';
import { MapPin } from 'src/entities/map-pin.entity';
import { Project } from 'src/entities/project.entity';
import { validateWebsite } from 'src/utility/website';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private fileService: FileService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private stripeService: StripeService,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async findOne(id: string) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });
  }

  async findOrganizationOwner(organizationUser: User) {
    if (organizationUser.type === UserType.PERSONAL) {
      return null;
    }

    const owner = await this.userRepository.findOne({
      where: {
        organizations: {
          id: organizationUser.id,
        },
      },
    });

    return owner;
  }

  async getUsers(input: UsersInput, _limit?: number, offset?: number) {
    const query = this.userRepository.createQueryBuilder('u');
    query.where('u."deletedAt" IS NULL');

    if (input.name) {
      query.andWhere(`u.username ILike '%${input.name}%'`);
    }
    if (input.hasProject) {
      query.andWhereExists(
        this.projectRepository
          .createQueryBuilder('p')
          .where('p."userId" = u.id'),
      );
    }
    if (input.type) {
      query.andWhere(`u.type = '${input.type}'`);
    }

    query.orderBy('u."isFeatured"', 'DESC');

    if (input.orderBy) {
      switch (input.orderBy) {
        case OrderUsersEnum.ALPHABETICAL:
          query.addOrderBy('u.username', 'ASC');
      }
    }

    query.addOrderBy('u."createdAt"', 'DESC');

    const limit = _limit ?? 20;
    query.limit(limit > 40 ? 40 : limit);
    query.offset((offset ?? 0) * limit);

    const result = await query.getManyAndCount();
    return {
      users: result[0],
      total: result[1],
    };
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

  async userExists(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) return { exists: false };
    return {
      exists: true,
      registrationStatus: await this.getRegistrationStatus(user),
    };
  }

  async update(input: UpdateUserInput, requesterId: string) {
    const user = await this.userRepository.findOne({
      where: { id: input.id },
      relations: { profilePicture: true },
    });
    const requester = await this.userRepository.findOneBy({ id: requesterId });

    if (!user || !requester) {
      throw BadUserInputException();
    }
    if (requester.role !== UserRoleEnum.ADMIN && requester.id !== input.id) {
      throw ForbiddenException();
    }

    if (input.username) {
      const usernameTaken = await this.userRepository.existsBy({
        username: input.username,
      });
      if (usernameTaken) {
        throw BadFieldsInputException([
          { message: 'Username taken', name: 'username', type: 'VALUE_TAKEN' },
        ]);
      }
      user.username = input.username;
    }
    if (input.password) {
      const validPassword = new RegExp(passwordRegex).test(input.password);
      if (!validPassword) {
        throw BadFieldsInputException([
          { message: 'Invalid password', name: 'password' },
        ]);
      }
      user.password = await bcrypt.hash(input.password, 10);
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
      const approximateLocation =
        await this.geocodingService.locationToApproximation(location);
      user.mapPin = new MapPin({
        address: approximateLocation.address,
        location: {
          type: 'Point',
          coordinates: [approximateLocation.lat, approximateLocation.lng],
        },
      });
    }
    if (input.city) {
      user.city = input.city;
    }
    if (input.name) {
      user.name = input.name;
    }
    if (input.phoneNumber !== undefined) {
      if (!swedishPhoneNumberRegex.test(input.phoneNumber)) {
        throw BadFieldsInputException([
          {
            message: 'Invalid phone number',
            name: 'phoneNumber',
            type: 'BAD_VALUE',
          },
        ]);
      }
      user.phoneNumber = input.phoneNumber;
    }
    if (input.email) {
      const validation = z
        .string()
        .email()
        .transform((value) => value.toLowerCase().trim());
      const result = validation.safeParse(input.email);
      if (!result.success) {
        throw BadUserInputException('Invalid email');
      }
      const emailExist = await this.userRepository.existsBy({
        email: result.data,
      });
      if (emailExist) {
        throw BadFieldsInputException([
          {
            message: 'email is taken',
            name: 'email',
            type: 'VALUE_TAKEN',
          },
        ]);
      }
      user.email = result.data;
    }
    if (input.postCode) {
      if (!swedishPostCodeRegex.test(input.postCode)) {
        throw BadFieldsInputException([
          { message: 'Invalid post code', name: 'postCode', type: 'BAD_VALUE' },
        ]);
      }
      user.postCode = input.postCode;
    }

    if (input.description !== undefined) {
      user.description = input.description;
    }
    if (input.profilePicture) {
      //remove existing
      if (user.profilePicture) {
        await this.fileService.deleteFiles([user.profilePicture]);
      }

      //add new
      user.profilePicture = await this.fileService.createFile(
        input.profilePicture,
      );
    }
    if (input.notifyOnMessage !== undefined) {
      user.notifyOnMessage = input.notifyOnMessage;
    }
    if (input.notifyOnPurchaseUpdate !== undefined) {
      user.notifyOnPurchaseUpdate = input.notifyOnPurchaseUpdate;
    }

    return {
      user: await this.userRepository.save(user),
      profilePicturePutUrl: user.profilePicture
        ? this.fileService.uploadFile(user.profilePicture, true)
        : null,
    };
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

  async createOrganizationUser(
    input: CreateOrganizationUserInput,
    currentUserId: string,
  ) {
    const creator = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: { organizations: true },
    });
    if (!creator) {
      throw BadUserInputException('Creator not found');
    }
    if (creator.organizations.some((o) => !o.deletedAt)) {
      throw ForbiddenException('User can only have one organization');
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
          type: 'VALUE_TAKEN',
        },
      ]);
    }
    //verify org number
    const onlyDigits = input.organizationNumber.replace(/\D/g, '');
    if (onlyDigits.length !== 10) {
      throw BadFieldsInputException([
        {
          message: 'Invalid organization number',
          name: 'organizationNumber',
          type: 'BAD_VALUE',
        },
      ]);
    }
    const organizationNumber = onlyDigits;

    const organizationUser = new User();
    organizationUser.organizationNumber = organizationNumber;
    organizationUser.username = input.organizationName;
    organizationUser.type = UserType.BUSINESS;

    creator.organizations = creator.organizations || [];
    creator.organizations.push(organizationUser);

    const _creator = await this.userRepository.save(creator);
    organizationUser.organizationUsers = [_creator];
    const _organizationUser = await this.userRepository.save(organizationUser);
    return _organizationUser;
  }
  async updateOrganizationUser(
    input: UpdateOrganizationUserInput,
    currentUserId: string,
  ) {
    const organization = await this.userRepository.findOne({
      where: { id: input.id },
      relations: {
        organizationUsers: true,
      },
    });

    if (
      organization.id !== currentUserId &&
      !organization.organizationUsers.some((ou) => ou.id === currentUserId)
    ) {
      throw ForbiddenException();
    }

    if (input.organizationName) {
      const usernameTaken = await this.userRepository.existsBy({
        username: input.organizationName,
        id: Not(organization.id),
      });
      if (usernameTaken) {
        throw BadFieldsInputException([
          { message: 'Username taken', name: 'username', type: 'VALUE_TAKEN' },
        ]);
      }
      organization.username = input.organizationName;
    }

    if (input.address) {
      organization.address = input.address;
      const location = await this.geocodingService.addressToLocation(
        input.address,
      );

      organization.addressLocation = {
        type: 'Point',
        coordinates: [location.lat, location.lng],
      };

      const approximateLocation =
        await this.geocodingService.locationToApproximation(location);
      organization.mapPin = new MapPin({
        address: approximateLocation.address,
        location: {
          type: 'Point',
          coordinates: [approximateLocation.lat, approximateLocation.lng],
        },
      });
    }
    if (input.city) {
      organization.city = input.city;
    }
    if (input.name) {
      organization.name = input.name;
    }
    if (input.phoneNumber) {
      if (!swedishPhoneNumberRegex.test(input.phoneNumber)) {
        throw BadUserInputException('Invalid phone number');
      }
      organization.phoneNumber = input.phoneNumber;
    }

    if (input.postCode) {
      if (!swedishPostCodeRegex.test(input.postCode)) {
        throw BadUserInputException('Invalid post code');
      }
      organization.postCode = input.postCode;
    }

    if (input.websiteUrl) {
      try {
        organization.websiteUrl = validateWebsite(input.websiteUrl);
      } catch {
        throw BadFieldsInputException([
          { message: 'Invalid url', name: 'websiteUrl', type: 'BAD_VALUE' },
        ]);
      }
    }

    return await this.userRepository.save(organization);
  }

  async organizationExists(organizationNumber: string) {
    return !!(await this.userRepository.findOne({
      where: { organizationNumber },
    }));
  }

  addressLocationToCoordinates(user: User, currentUserId: string) {
    if (user.id !== currentUserId) {
      throw ForbiddenException();
    }
    if (!user.addressLocation) {
      return null;
    }
    return {
      lat: user.addressLocation.coordinates[0],
      lng: user.addressLocation.coordinates[1],
    };
  }

  async onboardSellerAccount(currentUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) {
      return BadUserInputException();
    }

    return await this.stripeService.onboardAccount(user);
  }
  async createSellerAccount(currentUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) {
      return BadUserInputException();
    }

    return await this.stripeService.createConnectedAccount(user);
  }

  async addPayoutAccount(currentUserId: string, token: string) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      return BadUserInputException();
    }

    if (!user.connectedAccountId) {
      throw BadUserInputException('Missing seller account');
    }
    await this.stripeService.createExternalAccountCard(
      user.connectedAccountId,
      token,
    );

    return user;
  }
  async getPayoutAccount(currentUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) {
      return BadUserInputException();
    }

    if (!user.connectedAccountId) {
      return null;
    }
    const accounts = await this.stripeService.retrieveExternalAccounts(
      user.connectedAccountId,
    );

    const account = accounts.find((account) => account.default);
    return account;
  }

  async sellerAccountIsCreated(user: User) {
    if (!user.connectedAccountId) {
      return false;
    }
    return true;
  }
  async sellerAccountIsEnabled(user: User) {
    if (!user.connectedAccountId) {
      return false;
    }

    try {
      return await this.stripeService.accountIsEnabled(user.connectedAccountId);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        return !!user.connectedAccountId;
      }
      this.logger.error('sellerAccountIsCreated: error: ', e);
      throw InternalServerException('Error in sellerAccountIsEnabled');
    }
  }

  /**
   * Deletes user.
   * Does not remove it from database but instead anonymizes the user's data
   */
  async delete(userToDeleteId: string, currentUserId: string) {
    const userToDelete = await this.userRepository.findOne({
      where: {
        id: userToDeleteId,
      },
      relations: {
        products: {
          purchases: true,
          images: true,
        },
        profilePicture: true,
        refreshTokens: true,
      },
    });
    if (userToDelete.id !== currentUserId) {
      throw ForbiddenException();
    }

    //Can't delete a user if they have ongoing purchases
    const ongoingPurchase = userToDelete.products.some((product) =>
      product.purchases.some(
        (purchase) =>
          purchase.status !== PurchaseStatusEnum.FINISHED_FAILED &&
          purchase.status !== PurchaseStatusEnum.FINISHED_SUCCESS,
      ),
    );
    if (ongoingPurchase) {
      throw ForbiddenException(
        "Can't delete user while they have ongoing purchases",
      );
    }

    if (userToDelete.connectedAccountId) {
      await this.stripeService.deleteAccount(userToDelete);
    }

    //Anonymize products
    await Promise.all(
      userToDelete.products.map(async (product) => {
        await this.fileService.deleteFiles(product.images);
        product.address = null;
        product.addressLocation = null;
        product.mapPin = null;
        product.deletedAt = new Date();
        product.status = ProductStatus.DELETED;
        await this.productRepository.save(product);
      }),
    );

    //Anonymize user
    userToDelete.username = null;
    userToDelete.email = null;
    userToDelete.name = null;
    userToDelete.password = null;
    userToDelete.description = null;
    userToDelete.address = null;
    userToDelete.addressLocation = null;
    userToDelete.mapPin = null;
    userToDelete.postCode = null;
    userToDelete.city = null;
    userToDelete.phoneNumber = null;
    if (userToDelete.profilePicture) {
      await this.fileService.deleteFiles([userToDelete.profilePicture]);
      userToDelete.profilePicture = null;
    }
    await this.refreshTokenRepository.remove(userToDelete.refreshTokens);

    userToDelete.deletedAt = new Date();
    return this.userRepository.save(userToDelete);
  }

  async cmsListUsers(input: CmsListUsersInput): Promise<CmsListUsersResponse> {
    const { pageSize = 10, page = 0, searchString = '' } = input;
    const skip = Math.max(0, pageSize * page);

    let verifiedFilter: FindOptionsWhere<User> = {
      emailVerifiedAt: Not(IsNull()),
    };
    let businessFilter: FindOptionsWhere<User> = {
      type: UserType.BUSINESS,
    };
    if (input.canSell) {
      verifiedFilter = { ...verifiedFilter, connectedAccountId: Not(IsNull()) };
      businessFilter = { ...businessFilter, connectedAccountId: Not(IsNull()) };
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: [
        {
          name: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...verifiedFilter,
        },
        {
          username: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...verifiedFilter,
        },
        {
          email: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...verifiedFilter,
        },
        {
          name: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...businessFilter,
        },
        {
          username: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...businessFilter,
        },
        {
          email: ILike(`%${searchString}%`),
          deletedAt: IsNull(),
          ...businessFilter,
        },
      ],
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
    };
  }

  async cmsGetUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profilePicture: true },
    });
    if (!user) throw NotFoundException('User not found');
    return user;
  }

  async cmsUpdateUser(input: CmsUpdateUsersInput): Promise<User> {
    const { id, address, websiteUrl, ...rest } = input;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: { mapPin: true },
    });
    if (!user) throw NotFoundException('User not found');

    try {
      if (address) {
        const location = await this.geocodingService.addressToLocation(address);
        user.address = address;
        user.addressLocation = {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        };
        const approximateLocation =
          await this.geocodingService.locationToApproximation(location);
        if (user.mapPin) {
          user.mapPin.address = approximateLocation.address;
          user.mapPin.location = {
            type: 'Point',
            coordinates: [approximateLocation.lat, approximateLocation.lng],
          };
        } else {
          user.mapPin = new MapPin({
            address: approximateLocation.address,
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
          });
        }
      }

      if (websiteUrl) {
        try {
          user.websiteUrl = validateWebsite(websiteUrl);
        } catch {
          throw BadFieldsInputException([
            { message: 'Invalid url', name: 'websiteUrl', type: 'BAD_VALUE' },
          ]);
        }
      }

      Object.assign<User, Partial<User>>(user, {
        ...rest,
      });

      return this.userRepository.save(user);
    } catch (error) {
      throw BadUserInputException(`Failed to update user: ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteUnverifiedUsers() {
    this.logger.info({ message: 'running deleteUnverifiedUsers()' });
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const users = await this.userRepository.find({
      where: {
        emailVerifiedAt: IsNull(),
        deletedAt: IsNull(),
        createdAt: LessThan(oneWeekAgo),
        type: UserType.PERSONAL,
      },
      select: { id: true },
    });

    if (!users.length) return;
    this.logger.info({
      message: `Deleting ${users.length} number of users`,
      users,
    });

    const userIds = users.map((u) => u.id);
    await this.refreshTokenRepository.delete({ userId: In(userIds) });
    await this.userRepository.delete(userIds);
  }
}
