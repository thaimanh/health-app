// controllers/user.controller.ts
import { Request, Response } from 'express';
import { OK, CREATED, Paginated } from '../../../shared/utils/apiResponse';
import userService from './user.service';
import { asyncHandler } from '../../../shared/utils/catchAsync';

export class UserController {
  constructor() {}

  public createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    const newUser = await userService.createUser(userData);

    const message = 'Create user successfully';
    CREATED.sendCreated(res, message, newUser);
  });

  public getUsers = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      role: req.query.role as string,
    };

    const result = await userService.getUsers(filters);

    const message = `Get users successfully. Found ${result.total} items.`;

    Paginated.sendPaginated(res, result.users, result.total, filters.page, filters.limit, message);
  });

  public getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    const message = 'Get user successfully';
    OK.sendOK(res, message, user);
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await userService.updateUser(id, updateData);

    const message = 'Update user successfully';
    OK.sendOK(res, message, updatedUser);
  });

  public deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await userService.deleteUser(id);

    const message = 'Delete user successfully';
    OK.sendOK(res, message);
  });

  public getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const user = await userService.getUserById(userId);

    const message = 'Get user profile successfully';
    OK.sendOK(res, message, user);
  });

  public updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const updateData = req.body;

    const updatedUser = await userService.updateUser(userId, updateData);

    const message = 'Update user profile successfully';
    OK.sendOK(res, message, updatedUser);
  });
}

const userController = new UserController();
export default userController;
