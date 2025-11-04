import { StatusCodes, ReasonPhrases } from 'http-status-codes';

interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

interface SuccessResponseParams<T> {
  message?: string;
  metadata?: T;
  statusCode?: StatusCodes;
  reasonPhrase?: ReasonPhrases;
  pagination?: PaginationMetadata;
}

class SuccessResponse<T = object> {
  public message: string;
  public status: StatusCodes;
  public metadata: T;
  public pagination?: PaginationMetadata;

  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonPhrase = ReasonPhrases.OK,
    metadata = {} as T,
    pagination,
  }: SuccessResponseParams<T>) {
    this.message = message || reasonPhrase;
    this.status = statusCode;
    this.metadata = metadata;
    this.pagination = pagination;
  }

  send(): any {
    return this;
  }

  static sendOK<M>(message?: string, metadata?: M, pagination?: PaginationMetadata): any {
    return new OK<M>({ message, metadata, pagination }).send();
  }

  static sendCreated<M>(message?: string, metadata?: M): any {
    return new CREATED<M>({ message, metadata }).send();
  }

  /**
   * Static helper method to create and send a Paginated response.
   * @param res The response object.
   * @param data The array of items for the current page.
   * @param totalItems The total count of all items (across all pages).
   * @param currentPage The current page number.
   * @param itemsPerPage The number of items displayed per page.
   * @param message Optional custom message.
   * @returns The response object after sending.
   */
  static sendPaginated<M>(
    data: M[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    message?: string,
  ): any {
    return new Paginated<M>({
      message,
      data,
      totalItems,
      currentPage,
      itemsPerPage,
    }).send();
  }
}

class OK<T = object> extends SuccessResponse<T> {
  constructor({
    message,
    metadata,
    statusCode = StatusCodes.OK,
    reasonPhrase = ReasonPhrases.OK,
    pagination, // Pass pagination to super
  }: SuccessResponseParams<T>) {
    super({
      message,
      metadata,
      statusCode,
      reasonPhrase,
      pagination,
    });
  }
}

class CREATED<T = object> extends SuccessResponse<T> {
  constructor({
    message,
    metadata,
    statusCode = StatusCodes.CREATED,
    reasonPhrase = ReasonPhrases.CREATED,
  }: SuccessResponseParams<T>) {
    super({
      message,
      metadata,
      statusCode,
      reasonPhrase,
    });
  }
}

class Paginated<T = object> extends SuccessResponse<T[]> {
  constructor({
    message,
    data,
    totalItems,
    currentPage,
    itemsPerPage,
  }: {
    message?: string;
    data: T[];
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
  }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;

    const pagination: PaginationMetadata = {
      totalItems,
      itemsPerPage,
      currentPage,
      totalPages,
      hasNextPage,
    };

    super({
      message: message || ReasonPhrases.OK,
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      metadata: data,
      pagination,
    });
  }
}

export { OK, CREATED, Paginated, SuccessResponse, PaginationMetadata };
