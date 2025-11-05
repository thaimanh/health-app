import { IPagination, IPaginationMetadata } from './pagination.interface';

export interface IBaseResponse {
  message?: string;
  success?: boolean;
}

export interface IDataResponse<T = any> extends IBaseResponse {
  data: T;
}

export interface IPaginatedResponse<T = any> extends IBaseResponse {
  data: T[];
  pagination: IPagination;
}

export interface IApiResponse<T = any> {
  message: string;
  status: number;
  metadata: T;
  pagination?: IPaginationMetadata;
}

// For controller return types
export interface IControllerResponse<T = any> {
  data?: T;
  message?: string;
  pagination?: IPagination;
  [key: string]: any;
}
