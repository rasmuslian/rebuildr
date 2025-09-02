import { Injectable } from '@nestjs/common';
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
} from 'src/exceptions';
import { ILike, IsNull, Repository } from 'typeorm';
import { GeocodingService } from './geocoding.service';
import {
  CreateOrganizationUserInput,
  GetUsersInput,
  UpdateUserInput,
} from 'src/resolvers/user.resolver';
import { RockerService } from './rocker.service';
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private rockerService: RockerService,
    private fileService: FileService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findOne(id: string) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async getUsers(input: GetUsersInput): Promise<User[]> {
    return await this.userRepository.find({
      where: { username: ILike(`%${input.name}%`), deletedAt: IsNull() },
      take: input.pageSize || 10,
      skip: (input.page || 0) * (input.pageSize || 10),
    });
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
    }
    if (input.city) {
      user.city = input.city;
    }
    if (input.name) {
      user.name = input.name;
    }
    if (input.phoneNumber) {
      if (!swedishPhoneNumberRegex.test(input.phoneNumber)) {
        throw BadUserInputException('Invalid phone number');
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
        throw BadUserInputException('Invalid post code');
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

  /**
   * Function user to retrieve information about the selected payoutAccount
   * It uses what information Rocker can provide.
   */
  async getPayoutAccount(user: User) {
    if (!user.selectedPayoutMethod) {
      return null;
    }
    const accounts = await this.rockerService.getPayoutAccounts(user);

    const account = accounts.find(
      (account) =>
        this.rockerService.payoutAccountToPayoutMethod(
          user.selectedPayoutMethod,
        ) === account.provider,
    );
    if (!account) {
      return null;
    }

    return {
      ...account,
      provider: user.selectedPayoutMethod,
    };
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

    //Anonymize products
    await Promise.all(
      userToDelete.products.map(async (product) => {
        await this.fileService.deleteFiles(product.images);
        product.address = null;
        product.addressLocation = null;
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
    userToDelete.postCode = null;
    userToDelete.city = null;
    userToDelete.phoneNumber = null;
    if (userToDelete.profilePicture) {
      await this.fileService.deleteFiles([userToDelete.profilePicture]);
      userToDelete.profilePicture = null;
    }
    await this.refreshTokenRepository.remove(userToDelete.refreshTokens);

    //Rocker fields
    userToDelete.rockerUserId = null;
    userToDelete.payoutAccountBankGiroId = null;
    userToDelete.payoutAccountPlusGiroId = null;
    userToDelete.payoutAccountRixId = null;
    userToDelete.payoutAccountSwishId = null;
    userToDelete.selectedPayoutMethod = null;

    userToDelete.deletedAt = new Date();
    return this.userRepository.save(userToDelete);
  }
}
