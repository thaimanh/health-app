import { Prisma } from '@prisma/client';
import prismaService from '../../../service/prisma'; // Adjust path as needed
import {
  detailMealSelect,
  listMealSelect,
  CreateMealDto,
  MealQueryParams,
  UpdateMealDto,
} from './meal.dto';
import { InternalServerError, NotFoundError, ForbiddenError } from '../../../shared/errors'; // Adjust path as needed
import { createLogger, Logger } from '../../../shared/logger'; // Adjust path as needed

export class MealService {
  private readonly logger: Logger;
  private readonly mealRepository: Prisma.MealDelegate;

  constructor() {
    this.logger = createLogger({
      module: 'MealService',
    });
    this.mealRepository = prismaService.prisma.meal;
  }

  async createMeal(mealData: CreateMealDto, userId: string) {
    try {
      const meal = await this.mealRepository.create({
        data: {
          userId: userId, // Set userId from the authenticated user
          mealType: mealData.mealType,
          mealDate: mealData.mealDate,
          imageUrl: mealData.imageUrl,
          description: mealData.description,
          calories: mealData.calories,
          protein: mealData.protein,
          carbohydrates: mealData.carbohydrates,
          fats: mealData.fats,
        },
        select: detailMealSelect,
      });

      return meal;
    } catch (error: any) {
      this.logger.error(error?.message, 'Error creating meal entry:');
      throw new InternalServerError('Error creating meal entry');
    }
  }

  async getMeals(filters: MealQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MealWhereInput = {};

    if (filters.search) {
      where.OR = [{ description: { contains: filters.search, mode: 'insensitive' } }];
    }

    if (filters.mealType) {
      where.mealType = filters.mealType;
    }

    // Apply userId filter from the authenticated user
    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [meals, total] = await Promise.all([
      this.mealRepository.findMany({
        where,
        select: listMealSelect,
        skip,
        take: limit,
        orderBy: { mealDate: 'desc' }, // Order by most recent meal
      }),
      this.mealRepository.count({ where }),
    ]);

    return {
      meals,
      total,
    };
  }

  async getMealById(id: string, userId: string) {
    const meal = await this.mealRepository.findUnique({
      where: { id },
      select: detailMealSelect,
    });

    if (!meal) {
      throw new NotFoundError('Meal entry not found');
    }

    // Ownership check: Ensure the requested meal belongs to the authenticated user
    if (meal.userId !== userId) {
      throw new ForbiddenError('You are not authorized to access this meal entry');
    }

    return meal;
  }

  async updateMeal(id: string, updateData: UpdateMealDto, userId: string) {
    try {
      const existingMeal = await this.mealRepository.findUnique({
        where: { id },
      });

      if (!existingMeal) {
        throw new NotFoundError('Meal entry not found');
      }

      // Ownership check
      if (existingMeal.userId !== userId) {
        throw new ForbiddenError('You are not authorized to update this meal entry');
      }

      const meal = await this.mealRepository.update({
        where: { id },
        data: {
          mealType: updateData.mealType,
          mealDate: updateData.mealDate,
          imageUrl: updateData.imageUrl,
          description: updateData.description,
          calories: updateData.calories,
          protein: updateData.protein,
          carbohydrates: updateData.carbohydrates,
          fats: updateData.fats,
        },
        select: detailMealSelect,
      });

      return meal;
    } catch (error: any) {
      this.logger.error(error?.message, `Error updating meal entry ${id}:`);
      // Re-throw specific errors that are already handled (NotFound, Forbidden)
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError('Error updating meal entry');
    }
  }

  async deleteMeal(id: string, userId: string): Promise<void> {
    try {
      const meal = await this.mealRepository.findUnique({
        where: { id },
      });

      if (!meal) {
        throw new NotFoundError('Meal entry not found');
      }

      // Ownership check
      if (meal.userId !== userId) {
        throw new ForbiddenError('You are not authorized to delete this meal entry');
      }

      await this.mealRepository.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(error?.message, `Error deleting meal entry ${id}:`);
      // Re-throw specific errors that are already handled
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw error; // For any other unexpected errors
    }
  }
}

const mealService = new MealService();
export default mealService;
