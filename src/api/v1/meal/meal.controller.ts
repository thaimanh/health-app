import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  QueryParam,
  Authorized,
  HttpCode,
  CurrentUser,
} from 'routing-controllers';
import mealService from './meal.service';
import { CreateMealDto, UpdateMealDto } from './meal.dto';
import { MealType, User } from '@prisma/client';

@Controller('/meal')
export class MealController {
  @Post()
  @Authorized(['USER', 'ADMIN'])
  @HttpCode(201)
  async createMeal(@Body() mealData: CreateMealDto, @CurrentUser() currentUser: User) {
    const newMeal = await mealService.createMeal(mealData, currentUser.id);
    return {
      data: newMeal,
      message: 'Meal entry created successfully',
    };
  }

  @Get()
  @Authorized(['USER', 'ADMIN'])
  async getMeals(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @CurrentUser() currentUser: User,
    @QueryParam('search') search?: string,
    @QueryParam('mealType') mealType?: MealType,
  ) {
    const result = await mealService.getMeals({
      page,
      limit,
      search,
      mealType,
      userId: currentUser.id,
    });

    return {
      data: result.meals,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Meal entries retrieved successfully',
    };
  }

  @Get('/:id')
  @Authorized(['USER', 'ADMIN'])
  async getMealById(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const meal = await mealService.getMealById(id, currentUser.id);
    return {
      data: meal,
      message: 'Meal entry retrieved successfully',
    };
  }

  @Put('/:id')
  @Authorized(['USER', 'ADMIN'])
  async updateMeal(
    @Param('id') id: string,
    @Body() updateData: UpdateMealDto,
    @CurrentUser() currentUser: User,
  ) {
    const updatedMeal = await mealService.updateMeal(id, updateData, currentUser.id);
    return {
      data: updatedMeal,
      message: 'Meal entry updated successfully',
    };
  }

  @Delete('/:id')
  @Authorized(['USER', 'ADMIN'])
  async deleteMeal(@Param('id') id: string, @CurrentUser() currentUser: User) {
    await mealService.deleteMeal(id, currentUser.id);
    return {
      message: 'Meal entry deleted successfully',
    };
  }
}
