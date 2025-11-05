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
import diaryService from './diary.service';
import { CreateDiaryDto, UpdateDiaryDto } from './diary.dto';
import { User } from '@prisma/client';

@Controller('/diary')
@Authorized()
export class DiaryController {
  @Post()
  @HttpCode(201)
  async createDiary(@Body() diaryData: CreateDiaryDto, @CurrentUser() currentUser: User) {
    const newDiary = await diaryService.createDiary(diaryData, currentUser.id);
    return {
      data: newDiary,
      message: 'Create diary entry successfully',
    };
  }

  @Get()
  async getDiaries(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @CurrentUser() currentUser: User,
    @QueryParam('search') search?: string,
  ) {
    const result = await diaryService.getDiaries({ page, limit, search, userId: currentUser.id });

    return {
      data: result.diaries,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Diary entries retrieved successfully',
    };
  }

  @Get('/:id')
  async getDiaryById(
    @Param('id') id: string,
    @CurrentUser() currentUser: User, //
  ) {
    // Ensure the user can only access their own diary entry
    const diary = await diaryService.getDiaryById(id, currentUser.id);
    return {
      data: diary,
      message: 'Diary entry retrieved successfully',
    };
  }

  @Put('/:id')
  async updateDiary(
    @Param('id') id: string,
    @Body() updateData: UpdateDiaryDto,
    @CurrentUser() currentUser: User, //
  ) {
    const updatedDiary = await diaryService.updateDiary(id, updateData, currentUser.id);
    return {
      data: updatedDiary,
      message: 'Diary entry updated successfully',
    };
  }

  @Delete('/:id')
  async deleteDiary(@Param('id') id: string, @CurrentUser() currentUser: User) {
    await diaryService.deleteDiary(id, currentUser.id);
    return {
      message: 'Delete diary entry successfully',
    };
  }
}
