import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  Min,
  Max,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealType, MealType as PrismaMealType } from '@prisma/client';

export class CreateMealDto {
  @IsEnum(MealType)
  mealType!: MealType;

  @Type(() => Date)
  @IsDate()
  mealDate!: Date;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calories?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  protein?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carbohydrates?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fats?: number | null;
}

export class UpdateMealDto {
  @IsEnum(MealType)
  @IsOptional()
  mealType?: MealType;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  mealDate?: Date;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calories?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  protein?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carbohydrates?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fats?: number | null;
}

export class MealQueryParams {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(PrismaMealType)
  @IsOptional()
  mealType?: PrismaMealType;

  @IsString()
  @IsOptional()
  userId?: string; // This will be set by @CurrentUser in the controller for non-admin users
}

export const detailMealSelect = {
  id: true,
  userId: true,
  mealType: true,
  mealDate: true,
  imageUrl: true,
  description: true,
  calories: true,
  protein: true,
  carbohydrates: true,
  fats: true,
  createdAt: true,
  updatedAt: true,
};

export const listMealSelect = {
  id: true,
  userId: true,
  mealType: true,
  mealDate: true,
  imageUrl: true,
  calories: true,
  createdAt: true,
};
