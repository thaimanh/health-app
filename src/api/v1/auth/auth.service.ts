import { LoginDto, RegisterDto, RefreshTokenDto } from './auth.dto';
import userService from '../user/user.service';
import jwtService from '../../../service/jwt';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from '../../../shared/errors';
import { createLogger, Logger } from '../../../shared/logger';

export class AuthService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      module: 'AuthService',
    });
  }

  async login(loginData: LoginDto) {
    try {
      const user = await userService.getUserByEmail(loginData.email);

      const isValidPassword = await jwtService.comparePassword(loginData.password, user.password);
      if (!isValidPassword) {
        this.logger.warn('Invalid password attempt', { email: loginData.email });
        throw new UnauthorizedError('Invalid credentials');
      }

      const token = jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: token,
        user,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.logger.warn('Login attempt with non-existent email', { email: loginData.email });
        throw new UnauthorizedError('Invalid credentials');
      }
      this.logger.error('Login error', { error, email: loginData.email });
      throw error;
    }
  }

  async register(registerData: RegisterDto) {
    try {
      const newUser = await userService.createUser(registerData);
      return newUser;
    } catch (error) {
      this.logger.error({ error, email: registerData.email }, 'Registration error');
      throw new InternalServerError('Register user error');
    }
  }

  async refreshToken(refreshData: RefreshTokenDto) {
    try {
      if (!refreshData.token) {
        throw new BadRequestError('Token is required');
      }

      const decoded = jwtService.verifyToken(refreshData.token);

      const user = await userService.getUserById(decoded.userId);

      const newToken = jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newToken,
        user,
      };
    } catch (error) {
      this.logger.error('Token refresh error', { error });
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid token');
    }
  }
}

const authService = new AuthService();
export default authService;
