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
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import userService from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from '@prisma/client';

@Controller('/user')
@Authorized()
export class UserController {
  @Post()
  @HttpCode(201)
  @OpenAPI({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided data',
  })
  async createUser(@Body() userData: CreateUserDto) {
    const newUser = await userService.createUser(userData);
    return {
      data: newUser,
      message: 'Create user successfully',
    };
  }

  @Get()
  @Authorized(['ADMIN'])
  async getUsers(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @QueryParam('search') search?: string,
  ) {
    const result = await userService.getUsers({ page, limit, search });

    return {
      data: result.users,
      pagination: {
        total: result.total,
        page: page,
        limit: limit,
      },
      message: 'Users retrieved successfully',
    };
  }

  @Get('/:id')
  @OpenAPI({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID',
  })
  async getUserById(@Param('id') id: string) {
    const user = await userService.getUserById(id);
    return {
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Put('/:id')
  @OpenAPI({
    summary: 'Update user',
    description: 'Updates a specific user by their ID',
  })
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const updatedUser = await userService.updateUser(id, updateData);
    return {
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  @Delete('/:id')
  @Authorized(['ADMIN'])
  async deleteUser(@Param('id') id: string) {
    await userService.deleteUser(id);
    return {
      message: 'Delete user successfully',
    };
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
      data: userProfile,
      message: 'Get user profile successfully',
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
      data: updatedUser,
      message: 'Update user profile successfully',
    };
  }
}
