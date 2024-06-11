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
      console.log(e);
      throw new Error('Error when creating new user');
    }
  }
}
