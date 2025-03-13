import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { RegistrationStatusEnum, User } from 'src/entities/user.entity';
import { BadUserInputException, ForbiddenException } from 'src/exceptions';
import { Repository } from 'typeorm';
import { GeocodingService } from './geocoding.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async findOne(id: string) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async getRegistrationStatus(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user?.verified) {
      return RegistrationStatusEnum.EMAIL;
    }
    if (!user.password || !user.username) {
      return RegistrationStatusEnum.DETAILS;
    }

    return RegistrationStatusEnum.FINISHED;
  }

  async update(input: { id: string; address: string }, requesterId: string) {
    const user = await this.userRepository.findOneBy({ id: input.id });
    const requester = await this.userRepository.findOneBy({ id: requesterId });

    if (!user || !requester) {
      throw BadUserInputException();
    }
    const ability = this.caslAbilityFactory.createForUser(requester);
    if (!ability.can('update', user)) {
      throw ForbiddenException();
    }
    user.address = input.address;
    const location = await this.geocodingService.addressToLocation(
      input.address,
    );

    user.addressLocation = {
      type: 'Point',
      coordinates: [location.latitude, location.longitude],
    };

    return await this.userRepository.save(user);
  }
}
