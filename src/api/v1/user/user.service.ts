import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import prismaService from '../../../shared/prisma';
import {
  detailUserSelect,
  listUserSelect,
  CreateUserDto,
  UserQueryParams,
  UpdateUserDto,
} from './user.dto';
import { ConflictError, InternalServerError, NotFoundError } from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';

export class UserService {
  private readonly logger: Logger;
  private readonly userRepository: Prisma.UserDelegate;

  constructor() {
    this.logger = createLogger({
      module: 'UserService',
    });
    this.userRepository = prismaService.prisma.user;
  }

  async createUser(userData: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const existingUser = await this.userRepository.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new ConflictError('User already exists');
      }

      const user = await this.userRepository.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          userName: userData.userName,
          password: hashedPassword,
          email: userData.email,
          phone: userData.phone,
          role: (userData.role as UserRole) || UserRole.USER,
        },
        select: detailUserSelect,
      });

      return user;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new InternalServerError('Error creating user');
    }
  }

  async getUsers(filters: UserQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role as UserRole;
    }

    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        where,
        select: listUserSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.userRepository.count({ where }),
    ]);

    return {
      users,
      total,
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUnique({
      where: { id },
      select: detailUserSelect,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    try {
      const existingUser = await this.userRepository.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userRepository.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          throw new ConflictError('Email already exists');
        }
      }

      const user = await this.userRepository.update({
        where: { id },
        data: updateData,
        select: detailUserSelect,
      });

      this.logger.info('User updated successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw new InternalServerError('Error updating user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.userRepository.delete({
        where: { id },
      });

      this.logger.info('User deleted successfully', { userId: id });
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
