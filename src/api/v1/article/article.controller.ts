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
} from 'routing-controllers';
import articleService from './article.service';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { ArticleCategory } from '@prisma/client';

@Controller('/article')
export class ArticleController {
  @Post()
  @Authorized(['ADMIN'])
  @HttpCode(201)
  async createArticle(@Body() articleData: CreateArticleDto) {
    const newArticle = await articleService.createArticle(articleData);
    return {
      data: newArticle,
      message: 'Create article successfully',
    };
  }

  @Get()
  async getArticles(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @QueryParam('search') search?: string,
    @QueryParam('category') category?: ArticleCategory,
  ) {
    const result = await articleService.getArticles({ page, limit, search, category });

    return {
      data: result.articles,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Articles retrieved successfully',
    };
  }

  @Get('/:id')
  async getArticleById(@Param('id') id: string) {
    const article = await articleService.getArticleById(id);
    return {
      data: article,
      message: 'Article retrieved successfully',
    };
  }

  @Put('/:id')
  @Authorized(['ADMIN'])
  async updateArticle(@Param('id') id: string, @Body() updateData: UpdateArticleDto) {
    const updatedArticle = await articleService.updateArticle(id, updateData);
    return {
      data: updatedArticle,
      message: 'Article updated successfully',
    };
  }

  @Delete('/:id')
  @Authorized(['ADMIN'])
  async deleteArticle(@Param('id') id: string) {
    await articleService.deleteArticle(id);
    return {
      message: 'Delete article successfully',
    };
  }
}
