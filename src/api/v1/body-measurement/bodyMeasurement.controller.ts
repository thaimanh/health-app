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
import bodyMeasurementService from './bodyMeasurement.service';
import { CreateBodyMeasurementDto, UpdateBodyMeasurementDto } from './bodyMeasurement.dto';
import { User } from '@prisma/client';

@Controller('/body-measurement')
@Authorized()
export class BodyMeasurementController {
  @Post()
  @HttpCode(201)
  async createBodyMeasurement(
    @Body() measurementData: CreateBodyMeasurementDto,
    @CurrentUser() currentUser: User,
  ) {
    const newMeasurement = await bodyMeasurementService.createBodyMeasurement(
      measurementData,
      currentUser.id,
    );
    return {
      data: newMeasurement,
      message: 'Body measurement created successfully',
    };
  }

  @Get()
  async getBodyMeasurements(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @CurrentUser() currentUser: User,
  ) {
    const result = await bodyMeasurementService.getBodyMeasurements({
      page,
      limit,
      userId: currentUser.id,
    });

    return {
      data: result.bodyMeasurements,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Body measurements retrieved successfully',
    };
  }

  @Get('/:id')
  async getBodyMeasurementById(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const measurement = await bodyMeasurementService.getBodyMeasurementById(id, currentUser.id);
    return {
      data: measurement,
      message: 'Body measurement retrieved successfully',
    };
  }

  @Put('/:id')
  async updateBodyMeasurement(
    @Param('id') id: string,
    @Body() updateData: UpdateBodyMeasurementDto,
    @CurrentUser() currentUser: User,
  ) {
    const updatedMeasurement = await bodyMeasurementService.updateBodyMeasurement(
      id,
      updateData,
      currentUser.id,
    );
    return {
      data: updatedMeasurement,
      message: 'Body measurement updated successfully',
    };
  }

  @Delete('/:id')
  async deleteBodyMeasurement(@Param('id') id: string, @CurrentUser() currentUser: User) {
    await bodyMeasurementService.deleteBodyMeasurement(id, currentUser.id);
    return {
      message: 'Body measurement deleted successfully',
    };
  }
}
