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
import { ExerciseType, ExerciseType as PrismaExerciseType } from '@prisma/client';

export class CreateExerciseRecordDto {
  @Type(() => Date)
  @IsDate()
  exerciseDate!: Date;

  @IsEnum(ExerciseType)
  @IsOptional()
  exerciseType?: ExerciseType | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationMinutes?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  caloriesBurned?: number | null;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string | null;
}

export class UpdateExerciseRecordDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  exerciseDate?: Date;

  @IsEnum(ExerciseType)
  @IsOptional()
  exerciseType?: ExerciseType | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationMinutes?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  caloriesBurned?: number | null;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string | null;
}

export class ExerciseRecordQueryParams {
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

  @IsEnum(PrismaExerciseType)
  @IsOptional()
  exerciseType?: PrismaExerciseType;

  @IsString()
  @IsOptional()
  userId?: string;
}

export const detailExerciseRecordSelect = {
  id: true,
  userId: true,
  exerciseDate: true,
  exerciseType: true,
  durationMinutes: true,
  caloriesBurned: true,
  description: true,
  createdAt: true,
};

export const listExerciseRecordSelect = {
  id: true,
  userId: true,
  exerciseDate: true,
  exerciseType: true,
  durationMinutes: true,
  caloriesBurned: true,
  createdAt: true,
};
