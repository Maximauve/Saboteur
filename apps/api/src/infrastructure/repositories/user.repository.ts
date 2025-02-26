import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import { Repository } from 'typeorm';

import { UserM } from '@/domain/model/user';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import { UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';
import { User } from '@/infrastructure/entities/user.entity';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';

@Injectable()
export class DatabaseUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    private readonly translationService: TranslationService
  ) {}

  async getUserByUsername(username: string): Promise<UserM | null> {
    const adminUserEntity = await this.userEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!adminUserEntity) {
      return null;
    }
    return this.toUser(adminUserEntity);
  }

  async getAll(): Promise<UserM[]> {
    const users = await this.userEntityRepository.find();
    if (!users) {
      return [];
    }
    return users.map(user => this.toUser(user));
  }

  async getOneById(id: string): Promise<UserM | null> {
    const user = await this.userEntityRepository.findOne({
      where: {
        id: id,
      }
    });
    if (!user) {
      return null;
    }
    return this.toUser(user);
  }

  async getOneByEmail(email: string): Promise<UserM | null> {
    const user = await this.userEntityRepository.findOne({
      where: {
        email: email
      }
    });
    if (!user) {
      return null;
    }
    return this.toUser(user);
  }

  async insert(user: UserM): Promise<UserM> {
    const hashedPassword = await this.hashPassword(user.password);

    const userEntity = this.toUserEntity({ ...user, password: hashedPassword });
    const result = await this.userEntityRepository.insert(userEntity);
    const userId = result.identifiers[0].id;
    const insertedUser = await this.userEntityRepository.findOne({
      where: { id: userId },
    });
    return this.toUser(insertedUser ?? result.generatedMaps[0] as User);
  }

  async update(userId: string, userBody: UpdatedUserDto): Promise<void> {
    const userEntity = await this.userEntityRepository.findOne({
      where: { id: userId },
    });

    if (!userEntity) {
      throw new HttpException(await this.translationService.translate("error.USER_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }
  
    userEntity.username = userBody.username || userEntity.username;
    userEntity.email = userBody.email || userEntity.email;
  
    if (userBody.password) {
      const hashedPassword = await this.hashPassword(userBody.password);
      userEntity.password = hashedPassword;
    }
  
    await this.userEntityRepository.save(userEntity);
  }

  async deleteById(id: string): Promise<void> {
    const userEntity = await this.userEntityRepository.findOne({
      where: { id },
    });
  
    if (!userEntity) {
      throw new HttpException(await this.translationService.translate("error.USER_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }
  
    await this.userEntityRepository.delete({ id });
  }

  async checkUnknownUser(user: RegisterDto, userId?: string): Promise<boolean> {
    const unknownUser = await this.userEntityRepository.findOne({
      where: [
        { username: user.username },
        { email: user.email },
      ],
    });
  
    if (!unknownUser || (userId && unknownUser.id === userId)) {
      return false;
    }
    return true;
  }
  

  private toUser(userEntity: User): UserM {
    const user: UserM = new UserM();

    user.id = userEntity.id;
    user.username = userEntity.username;
    user.email = userEntity.email;
    user.password = userEntity.password;
    user.role = userEntity.role;
    user.createdDate = userEntity.createdDate;

    return user;
  }

  private toUserEntity(user: UserM): User {
    const userEntity: User = new User();

    userEntity.username = user.username;
    userEntity.password = user.password;
    userEntity.email = user.email;
    userEntity.createdDate = user.createdDate;
    userEntity.role = user.role;

    return userEntity;
  }


  private hashPassword(plaintextPassword: string) {
    return bcrypt.hash(plaintextPassword, 10);
  }
}
