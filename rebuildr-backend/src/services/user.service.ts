import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    //TODO: get coordinates of address to create a point
    user.addressLocation = { type: 'Point', coordinates: [1.98, 2.76] };

    return await this.userRepository.save(user);
  }
}
