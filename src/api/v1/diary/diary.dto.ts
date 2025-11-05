import { IsString, IsOptional, IsDate, IsNumber, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiaryDto {
  @Type(() => Date)
  @IsDate()
  entryDate!: Date;

  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string | null;

  @IsString()
  @MinLength(10)
  content!: string;
}

export class UpdateDiaryDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  entryDate?: Date;

  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string | null;

  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;
}

export class DiaryQueryParams {
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

  @IsString()
  @IsOptional()
  userId?: string;
}

export const detailDiarySelect = {
  id: true,
  userId: true,
  entryDate: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

export const listDiarySelect = {
  id: true,
  userId: true,
  entryDate: true,
  content: true,
  title: true,
  createdAt: true,
};
