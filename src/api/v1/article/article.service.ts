import { Prisma } from '@prisma/client';
import prismaService from '../../../service/prisma';
import {
  detailArticleSelect,
  listArticleSelect,
  CreateArticleDto,
  ArticleQueryParams,
  UpdateArticleDto,
} from './article.dto';
import { InternalServerError, NotFoundError } from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';

export class ArticleService {
  private readonly logger: Logger;
  private readonly articleRepository: Prisma.ArticleDelegate;

  constructor() {
    this.logger = createLogger({
      module: 'ArticleService',
    });
    this.articleRepository = prismaService.prisma.article;
  }

  async createArticle(articleData: CreateArticleDto) {
    try {
      const article = await this.articleRepository.create({
        data: {
          title: articleData.title,
          category: articleData.category,
          publishDate: articleData.publishDate,
          imageUrl: articleData.imageUrl,
          content: articleData.content,
          author: articleData.author,
        },
        select: detailArticleSelect,
      });

      return article;
    } catch (error: any) {
      this.logger.error(error?.message, 'Error creating article:');
      throw new InternalServerError('Error creating article');
    }
  }

  async getArticles(filters: ArticleQueryParams) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const [articles, total] = await Promise.all([
      this.articleRepository.findMany({
        where,
        select: listArticleSelect,
        skip,
        take: limit,
        orderBy: { publishDate: 'desc' },
      }),
      this.articleRepository.count({ where }),
    ]);

    return {
      articles,
      total,
    };
  }

  async getArticleById(id: string) {
    const article = await this.articleRepository.findUnique({
      where: { id },
      select: detailArticleSelect,
    });

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    return article;
  }

  async updateArticle(id: string, updateData: UpdateArticleDto) {
    try {
      const existingArticle = await this.articleRepository.findUnique({
        where: { id },
      });

      if (!existingArticle) {
        throw new NotFoundError('Article not found');
      }

      const article = await this.articleRepository.update({
        where: { id },
        data: {
          title: updateData.title,
          category: updateData.category,
          publishDate: updateData.publishDate,
          imageUrl: updateData.imageUrl,
          content: updateData.content,
          author: updateData.author,
          viewsCount: updateData.viewsCount,
        },
        select: detailArticleSelect,
      });

      return article;
    } catch (error: any) {
      this.logger.error(error?.message, `Error updating article ${id}:`);
      throw new InternalServerError('Error updating article');
    }
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      const article = await this.articleRepository.findUnique({
        where: { id },
      });

      if (!article) {
        throw new NotFoundError('Article not found');
      }

      await this.articleRepository.delete({
        where: { id },
      });
    } catch (error: any) {
      this.logger.error(error?.message, `Error deleting article ${id}:`);
      throw error;
    }
  }
}

const articleService = new ArticleService();
export default articleService;
