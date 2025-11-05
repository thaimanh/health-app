import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';
import { SuccessResponse, OK, CREATED, Paginated } from '../shared/utils/apiResponse';
import { IPaginatedResponse } from '../interface';
import { logger } from '../shared/logger';

@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, content: any) {
    const request = action.request;
    const response = action.response;

    // Log http response
    if (!request._logged) {
      request._logged = true;
      const startTime = request.startTime || Date.now();

      response.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger.info(
          `${request.method} ${request.originalUrl} ${response.statusCode} - ${responseTime}ms`,
        );
      });
    }

    // Skip if already formatted or error
    if (content instanceof SuccessResponse || response.statusCode >= 400) {
      return content;
    }

    // Handle 204 No Content (DELETE)
    if (response.statusCode === 204) {
      return undefined;
    }

    // Handle pagination
    if (this.isPaginatedResponse(content)) {
      const { data, pagination, message } = content;
      return new Paginated({
        message: message || this.getDefaultMessage(request.method),
        data,
        totalItems: pagination.total,
        currentPage: pagination.page,
        itemsPerPage: pagination.limit,
      });
    }

    // Handle structured responses with data/message
    if (content && typeof content === 'object' && content.data !== undefined) {
      return new OK({
        message: content.message || this.getDefaultMessage(request.method),
        metadata: content.data,
      });
    }

    // Handle raw data
    switch (request.method) {
      case 'POST':
        return new CREATED({
          message: this.getDefaultMessage('POST'),
          metadata: content,
        });

      case 'PUT':
      case 'PATCH':
        return new OK({
          message: this.getDefaultMessage('PUT'),
          metadata: content,
        });

      case 'DELETE':
        return new OK({
          message: this.getDefaultMessage('DELETE'),
          metadata: content,
        });

      default:
        return new OK({
          message: this.getDefaultMessage('GET'),
          metadata: content,
        });
    }
  }

  private isPaginatedResponse(content: any): content is IPaginatedResponse {
    return (
      content &&
      typeof content === 'object' &&
      content.pagination &&
      typeof content.pagination === 'object' &&
      typeof content.pagination.total === 'number' &&
      typeof content.pagination.page === 'number' &&
      typeof content.pagination.limit === 'number' &&
      Array.isArray(content.data)
    );
  }

  private getDefaultMessage(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): string {
    const messages = {
      POST: 'Resource created successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
      GET: 'Data retrieved successfully',
    };
    return messages[method] || 'Operation completed successfully';
  }
}
