import { IsString, IsOptional, IsDate, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBodyMeasurementDto {
  @Type(() => Date)
  @IsDate()
  measurementDate!: Date;

  @IsNumber()
  @Min(0)
  weightKg!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPercentage!: number;
}

export class UpdateBodyMeasurementDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  measurementDate?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  bodyFatPercentage?: number;
}

export class BodyMeasurementQueryParams {
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
  userId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  targetDate?: Date;
}

export const detailBodyMeasurementSelect = {
  id: true,
  userId: true,
  measurementDate: true,
  weightKg: true,
  bodyFatPercentage: true,
  createdAt: true,
};

export const listBodyMeasurementSelect = {
  id: true,
  userId: true,
  measurementDate: true,
  weightKg: true,
  bodyFatPercentage: true,
  createdAt: true,
};

// New DTO for aggregated results (optional, but good practice for clarity)
export interface AggregatedBodyMeasurementDto {
  date: string; // e.g., "2023-01", "2023-W01", "2023"
  averageWeightKg: number;
  averageBodyFatPercentage: number;
  count: number;
}
