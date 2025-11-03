import { UserRole } from '@prisma/client';

export interface ICreateUser {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface IResponseListUser {
  id: string;
  userName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}

export interface IResponseDetailUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}
export interface IPaginationResponseListUser {
  users: IResponseListUser[];
  total: number;
}

export interface IUpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface IUserFilters {
  limit?: number;
  page?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const detailUserSelect = {
  id: true,
  userName: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  updatedAt: true,
  createdAt: true,
};

export const listUserSelect = {
  id: true,
  userName: true,
  email: true,
  phone: true,
  createdAt: true,
};
