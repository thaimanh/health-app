import { Action } from 'routing-controllers';
import jwtService from '../jwt';

export function authorizationChecker(action: Action, roles: string[]): boolean {
  const request = action.request;
  const authHeader = request.headers.authorization;

  // Extract token
  const token = jwtService.extractTokenFromHeader(authHeader);
  if (!token) {
    return false;
  }

  try {
    // Verify token
    const decoded = jwtService.verifyToken(token);

    // Attach user to request
    request.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // Check roles if required
    if (roles && roles.length > 0) {
      return roles.includes(decoded.role);
    }

    return true;
  } catch (error) {
    return false;
  }
}
