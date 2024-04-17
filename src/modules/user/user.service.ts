import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories';
import { User } from 'src/entities';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  /**
   * Create User
   *
   * @async
   * @param {Partial<User>} userData
   * @returns {Promise<User>}
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.create(userData);
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Find by email or phone
   *
   * @async
   * @param {string} username
   * @returns {(Promise<User | null>)}
   */
  async findByEmailOrPhone(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ email: username }, { phone: username }],
    });
  }

  /**
   * Find user
   *
   * @async
   * @param {FindOptionsWhere<User> | FindOptionsWhere<User>[]} userData
   * @returns {Promise<User>}
   */
  async findUser(
    userData: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User> {
    return this.usersRepository.findOne({ where: userData });
  }
}
