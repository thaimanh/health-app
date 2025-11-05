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
import exerciseRecordService from './exerciseRecord.service';
import { CreateExerciseRecordDto, UpdateExerciseRecordDto } from './exerciseRecord.dto';
import { ExerciseType, User } from '@prisma/client';

@Controller('/exercise-record')
export class ExerciseRecordController {
  @Post()
  @Authorized(['USER', 'ADMIN'])
  @HttpCode(201)
  async createExerciseRecord(
    @Body() recordData: CreateExerciseRecordDto,
    @CurrentUser() currentUser: User,
  ) {
    const newRecord = await exerciseRecordService.createExerciseRecord(recordData, currentUser.id);
    return {
      data: newRecord,
      message: 'Exercise record created successfully',
    };
  }

  @Get()
  @Authorized(['USER', 'ADMIN'])
  async getExerciseRecords(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @CurrentUser() currentUser: User,
    @QueryParam('search') search?: string,
    @QueryParam('exerciseType') exerciseType?: ExerciseType,
  ) {
    const result = await exerciseRecordService.getExerciseRecords({
      page,
      limit,
      search,
      exerciseType,
      userId: currentUser.id,
    });

    return {
      data: result.exerciseRecords,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Exercise records retrieved successfully',
    };
  }

  @Get('/:id')
  @Authorized(['USER', 'ADMIN'])
  async getExerciseRecordById(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const record = await exerciseRecordService.getExerciseRecordById(id, currentUser.id);
    return {
      data: record,
      message: 'Exercise record retrieved successfully',
    };
  }

  @Put('/:id')
  @Authorized(['USER', 'ADMIN'])
  async updateExerciseRecord(
    @Param('id') id: string,
    @Body() updateData: UpdateExerciseRecordDto,
    @CurrentUser() currentUser: User,
  ) {
    const updatedRecord = await exerciseRecordService.updateExerciseRecord(
      id,
      updateData,
      currentUser.id,
    );
    return {
      data: updatedRecord,
      message: 'Exercise record updated successfully',
    };
  }

  @Delete('/:id')
  @Authorized(['USER', 'ADMIN'])
  async deleteExerciseRecord(@Param('id') id: string, @CurrentUser() currentUser: User) {
    await exerciseRecordService.deleteExerciseRecord(id, currentUser.id);
    return {
      message: 'Exercise record deleted successfully',
    };
  }
}
