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
  CurrentUser,
  HttpCode,
  OnUndefined,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import userService from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from '@prisma/client';
import { CREATED, OK, Paginated } from '../../../shared/utils/apiResponse';

@Controller('/user')
@OpenAPI({ security: [{ bearerAuth: [] }] })
export class UserController {
  @Post()
  @HttpCode(201)
  @OpenAPI({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided data',
  })
  async createUser(@Body() userData: CreateUserDto) {
    const newUser = await userService.createUser(userData);
    CREATED.sendCreated('Create user successfully', newUser);
  }

  @Get()
  @OpenAPI({
    summary: 'Get all users',
    description: 'Retrieves a paginated list of users with optional filtering',
  })
  async getUsers(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @QueryParam('search') search?: string,
    @QueryParam('role') role?: string,
  ) {
    const filters = {
      page: Math.max(1, page),
      limit: Math.min(100, limit),
      search,
      role,
    };

    const result = await userService.getUsers(filters);

    Paginated.sendPaginated(
      result.users,
      result.total,
      filters.page,
      filters.limit,
      'Get list user successfully',
    );
  }

  @Get('/:id')
  @OpenAPI({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID',
  })
  async getUserById(@Param('id') id: string) {
    const user = await userService.getUserById(id);
    OK.sendOK('Get detail user successfully', user);
  }

  @Put('/:id')
  @OpenAPI({
    summary: 'Update user',
    description: 'Updates a specific user by their ID',
  })
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const updatedUser = await userService.updateUser(id, updateData);
    OK.sendOK('Update user successfully', updatedUser);
  }

  @Delete('/:id')
  @HttpCode(204)
  @OnUndefined(204)
  @OpenAPI({
    summary: 'Delete user',
    description: 'Deletes a specific user by their ID',
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await userService.deleteUser(id);
  }

  @Get('/me/profile')
  @Authorized()
  @OpenAPI({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user',
  })
  async getCurrentUser(@CurrentUser() user: User) {
    const userProfile = await userService.getUserById(user.id);
    return {
      success: true,
      message: 'Get user profile successfully',
      data: userProfile,
    };
  }

  @Put('/me/profile')
  @Authorized()
  @OpenAPI({
    summary: 'Update current user profile',
    description: 'Updates the profile of the currently authenticated user',
  })
  async updateCurrentUser(@CurrentUser() user: User, @Body() updateData: UpdateUserDto) {
    const updatedUser = await userService.updateUser(user.id, updateData);
    return {
      success: true,
      message: 'Update user profile successfully',
      data: updatedUser,
    };
  }
}
