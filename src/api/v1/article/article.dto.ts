import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleCategory, ArticleCategory as PrismaArticleCategory } from '@prisma/client'; // Import Prisma's enum

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @IsEnum(ArticleCategory)
  @IsOptional()
  category?: ArticleCategory | null;

  @Type(() => Date)
  @IsDate()
  publishDate!: Date;

  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  author?: string | null;
}

export class UpdateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsEnum(ArticleCategory)
  @IsOptional()
  category?: ArticleCategory | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  publishDate?: Date;

  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;

  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  author?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  viewsCount?: number;
}

export class ArticleQueryParams {
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
  category?: PrismaArticleCategory;
}

// Select fields for different use cases
export const detailArticleSelect = {
  id: true,
  title: true,
  category: true,
  publishDate: true,
  imageUrl: true,
  content: true,
  author: true,
  viewsCount: true,
  createdAt: true,
  updatedAt: true,
};

export const listArticleSelect = {
  id: true,
  title: true,
  category: true,
  publishDate: true,
  imageUrl: true,
  author: true,
  viewsCount: true,
  createdAt: true,
};
