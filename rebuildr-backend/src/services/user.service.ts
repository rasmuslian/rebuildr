import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { GeocodingService } from './geocoding.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
  ) {}

  async createUser(user: { email: string; password: string }) {
    try {
      return await this.userRepository.save(user);
    } catch (e) {
      throw new Error('Error when creating new user');
    }
  }

  async findOne(id: string) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async update(input: { id: string; address: string }) {
    const user = await this.userRepository.findOneBy({ id: input.id });

    if (!user) {
      throw new Error('No user found');
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
