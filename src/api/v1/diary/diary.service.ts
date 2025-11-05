import { Prisma } from '@prisma/client';
import prismaService from '../../../service/prisma';
import {
  detailDiarySelect,
  listDiarySelect,
  CreateDiaryDto,
  DiaryQueryParams,
  UpdateDiaryDto,
} from './diary.dto';
import { InternalServerError, NotFoundError, ForbiddenError } from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';

export class DiaryService {
  private readonly logger: Logger;
  private readonly diaryRepository: Prisma.DiaryDelegate;

  constructor() {
    this.logger = createLogger({
      module: 'DiaryService',
    });
    this.diaryRepository = prismaService.prisma.diary;
  }

  async createDiary(diaryData: CreateDiaryDto, userId: string) {
    try {
      const diary = await this.diaryRepository.create({
        data: {
          userId: userId,
          entryDate: diaryData.entryDate,
          title: diaryData.title,
          content: diaryData.content,
        },
        select: detailDiarySelect,
      });

      return diary;
    } catch (error: any) {
      this.logger.error(error?.message, 'Error creating diary entry:');
      throw new InternalServerError('Error creating diary entry');
    }
  }

  async getDiaries(filters: DiaryQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.DiaryWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [diaries, total] = await Promise.all([
      this.diaryRepository.findMany({
        where,
        select: listDiarySelect,
        skip,
        take: limit,
        orderBy: { entryDate: 'desc' },
      }),
      this.diaryRepository.count({ where }),
    ]);

    return {
      diaries,
      total,
    };
  }

  async getDiaryById(id: string, userId: string) {
    const diary = await this.diaryRepository.findUnique({
      where: { id },
      select: detailDiarySelect,
    });

    if (!diary) {
      throw new NotFoundError('Diary entry not found');
    }

    if (diary.userId !== userId) {
      throw new ForbiddenError('You are not authorized to access this diary entry');
    }

    return diary;
  }

  async updateDiary(id: string, updateData: UpdateDiaryDto, userId: string) {
    try {
      const existingDiary = await this.diaryRepository.findUnique({
        where: { id },
      });

      if (!existingDiary) {
        throw new NotFoundError('Diary entry not found');
      }

      if (existingDiary.userId !== userId) {
        throw new ForbiddenError('You are not authorized to update this diary entry');
      }

      const diary = await this.diaryRepository.update({
        where: { id },
        data: {
          entryDate: updateData.entryDate,
          title: updateData.title,
          content: updateData.content,
        },
        select: detailDiarySelect,
      });

      return diary;
    } catch (error: any) {
      this.logger.error(error?.message, `Error updating diary entry ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError('Error updating diary entry');
    }
  }

  async deleteDiary(id: string, userId: string): Promise<void> {
    try {
      const diary = await this.diaryRepository.findUnique({
        where: { id },
      });

      if (!diary) {
        throw new NotFoundError('Diary entry not found');
      }

      if (diary.userId !== userId) {
        throw new ForbiddenError('You are not authorized to delete this diary entry');
      }

      await this.diaryRepository.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(error?.message, `Error deleting diary entry ${id}:`);
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw error;
    }
  }
}

const diaryService = new DiaryService();
export default diaryService;
