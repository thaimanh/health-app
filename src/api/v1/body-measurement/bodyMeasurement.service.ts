import { Prisma } from '@prisma/client';
import prismaService from '../../../service/prisma';
import {
  detailBodyMeasurementSelect,
  listBodyMeasurementSelect,
  CreateBodyMeasurementDto,
  BodyMeasurementQueryParams,
  UpdateBodyMeasurementDto,
} from './bodyMeasurement.dto';
import {
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export class BodyMeasurementService {
  private readonly logger: Logger;
  private readonly bodyMeasurementRepository: Prisma.BodyMeasurementDelegate;
  private readonly userRepository: Prisma.UserDelegate; // Add user repository

  constructor() {
    this.logger = createLogger({
      module: 'BodyMeasurementService',
    });
    this.bodyMeasurementRepository = prismaService.prisma.bodyMeasurement;
    this.userRepository = prismaService.prisma.user;
  }

  async createBodyMeasurement(measurementData: CreateBodyMeasurementDto, userId: string) {
    try {
      const measurement = await this.bodyMeasurementRepository.create({
        data: {
          userId: userId,
          measurementDate: measurementData.measurementDate,
          weightKg: measurementData.weightKg,
          bodyFatPercentage: measurementData.bodyFatPercentage,
        },
        select: detailBodyMeasurementSelect,
      });

      // let cached 30 recent record for graph
      // get recent day body measurements
      const user = await this.userRepository.findUnique({
        where: { id: userId },
        select: { recentDayBodyMeasurements: true },
      });

      if (!user) {
        throw new BadRequestError('User not found');
      }

      let updatedRecentMeasurements = user.recentDayBodyMeasurements;

      // Add the new measurement
      updatedRecentMeasurements.push({
        id:
          updatedRecentMeasurements.length > 0
            ? Math.max(...updatedRecentMeasurements.map((m) => m.id)) + 1
            : 1,
        date: measurementData.measurementDate,
        weightKg: measurementData.weightKg,
        bodyFatPercentage: measurementData.bodyFatPercentage,
      });

      // Check if it exceeds 30 records -> remove oldest record
      if (updatedRecentMeasurements.length > 30) {
        updatedRecentMeasurements.sort((a, b) => a.date.getTime() - b.date.getTime());
        updatedRecentMeasurements = updatedRecentMeasurements.slice(1);
      }

      // Update the user with the modified recentDayBodyMeasurements
      await this.userRepository.update({
        where: { id: userId },
        data: {
          recentDayBodyMeasurements: updatedRecentMeasurements,
        },
      });

      return measurement;
    } catch (error: any) {
      this.logger.error(error?.message, 'Error creating body measurement:');
      throw new InternalServerError('Error creating body measurement');
    }
  }

  async getBodyMeasurements(filters: BodyMeasurementQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BodyMeasurementWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [bodyMeasurements, total] = await Promise.all([
      this.bodyMeasurementRepository.findMany({
        where,
        select: listBodyMeasurementSelect,
        skip,
        take: limit,
        orderBy: { measurementDate: 'desc' },
      }),
      this.bodyMeasurementRepository.count({ where }),
    ]);

    return {
      bodyMeasurements,
      total,
    };
  }

  async getBodyMeasurementById(id: string, userId: string) {
    const measurement = await this.bodyMeasurementRepository.findUnique({
      where: { id },
      select: detailBodyMeasurementSelect,
    });

    if (!measurement) {
      throw new NotFoundError('Body measurement not found');
    }

    if (measurement.userId !== userId) {
      throw new ForbiddenError('You are not authorized to access this body measurement');
    }

    return measurement;
  }

  async updateBodyMeasurement(id: string, updateData: UpdateBodyMeasurementDto, userId: string) {
    try {
      const existingMeasurement = await this.bodyMeasurementRepository.findUnique({
        where: { id },
      });

      if (!existingMeasurement) {
        throw new NotFoundError('Body measurement not found');
      }

      if (existingMeasurement.userId !== userId) {
        throw new ForbiddenError('You are not authorized to update this body measurement');
      }

      const measurement = await this.bodyMeasurementRepository.update({
        where: { id },
        data: {
          measurementDate: updateData.measurementDate,
          weightKg: updateData.weightKg,
          bodyFatPercentage: updateData.bodyFatPercentage,
        },
        select: detailBodyMeasurementSelect,
      });

      return measurement;
    } catch (error: any) {
      this.logger.error(error?.message, `Error updating body measurement ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError('Error updating body measurement');
    }
  }

  async deleteBodyMeasurement(id: string, userId: string): Promise<void> {
    try {
      const measurement = await this.bodyMeasurementRepository.findUnique({
        where: { id },
      });

      if (!measurement) {
        throw new NotFoundError('Body measurement not found');
      }

      if (measurement.userId !== userId) {
        throw new ForbiddenError('You are not authorized to delete this body measurement');
      }

      await this.bodyMeasurementRepository.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(error?.message, `Error deleting body measurement ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw error;
    }
  }
}

const bodyMeasurementService = new BodyMeasurementService();
export default bodyMeasurementService;
