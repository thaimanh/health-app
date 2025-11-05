import { Prisma } from '@prisma/client';
import prismaService from '../../../service/prisma';
import {
  detailExerciseRecordSelect,
  listExerciseRecordSelect,
  CreateExerciseRecordDto,
  ExerciseRecordQueryParams,
  UpdateExerciseRecordDto,
} from './exerciseRecord.dto';
import { InternalServerError, NotFoundError, ForbiddenError } from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';

export class ExerciseRecordService {
  private readonly logger: Logger;
  private readonly exerciseRecordRepository: Prisma.ExerciseRecordDelegate;

  constructor() {
    this.logger = createLogger({
      module: 'ExerciseRecordService',
    });
    this.exerciseRecordRepository = prismaService.prisma.exerciseRecord;
  }

  async createExerciseRecord(recordData: CreateExerciseRecordDto, userId: string) {
    try {
      const record = await this.exerciseRecordRepository.create({
        data: {
          userId: userId,
          exerciseDate: recordData.exerciseDate,
          exerciseType: recordData.exerciseType,
          durationMinutes: recordData.durationMinutes,
          caloriesBurned: recordData.caloriesBurned,
          description: recordData.description,
        },
        select: detailExerciseRecordSelect,
      });

      return record;
    } catch (error: any) {
      this.logger.error(error?.message, 'Error creating exercise record:');
      throw new InternalServerError('Error creating exercise record');
    }
  }

  async getExerciseRecords(filters: ExerciseRecordQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseRecordWhereInput = {};

    if (filters.search) {
      where.OR = [{ description: { contains: filters.search, mode: 'insensitive' } }];
    }

    if (filters.exerciseType) {
      where.exerciseType = filters.exerciseType;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [exerciseRecords, total] = await Promise.all([
      this.exerciseRecordRepository.findMany({
        where,
        select: listExerciseRecordSelect,
        skip,
        take: limit,
        orderBy: { exerciseDate: 'desc' },
      }),
      this.exerciseRecordRepository.count({ where }),
    ]);

    return {
      exerciseRecords,
      total,
    };
  }

  async getExerciseRecordById(id: string, userId: string) {
    const record = await this.exerciseRecordRepository.findUnique({
      where: { id },
      select: detailExerciseRecordSelect,
    });

    if (!record) {
      throw new NotFoundError('Exercise record not found');
    }

    if (record.userId !== userId) {
      throw new ForbiddenError('You are not authorized to access this exercise record');
    }

    return record;
  }

  async updateExerciseRecord(id: string, updateData: UpdateExerciseRecordDto, userId: string) {
    try {
      const existingRecord = await this.exerciseRecordRepository.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new NotFoundError('Exercise record not found');
      }

      if (existingRecord.userId !== userId) {
        throw new ForbiddenError('You are not authorized to update this exercise record');
      }

      const record = await this.exerciseRecordRepository.update({
        where: { id },
        data: {
          exerciseDate: updateData.exerciseDate,
          exerciseType: updateData.exerciseType,
          durationMinutes: updateData.durationMinutes,
          caloriesBurned: updateData.caloriesBurned,
          description: updateData.description,
        },
        select: detailExerciseRecordSelect,
      });

      return record;
    } catch (error: any) {
      this.logger.error(error?.message, `Error updating exercise record ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError('Error updating exercise record');
    }
  }

  async deleteExerciseRecord(id: string, userId: string): Promise<void> {
    try {
      const record = await this.exerciseRecordRepository.findUnique({
        where: { id },
      });

      if (!record) {
        throw new NotFoundError('Exercise record not found');
      }

      if (record.userId !== userId) {
        throw new ForbiddenError('You are not authorized to delete this exercise record');
      }

      await this.exerciseRecordRepository.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(error?.message, `Error deleting exercise record ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw error;
    }
  }
}

const exerciseRecordService = new ExerciseRecordService();
export default exerciseRecordService;
