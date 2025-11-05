import { Controller, Post, Body, HttpCode } from 'routing-controllers';
import authService from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './auth.dto';

@Controller('/auth')
export class AuthController {
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginData: LoginDto) {
    const authResponse = await authService.login(loginData);

    return {
      data: authResponse,
      message: 'Login successfully',
    };
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() registerData: RegisterDto) {
    const authResponse = await authService.register(registerData);

    return {
      data: authResponse,
      message: 'Registration successfully',
    };
  }

  @Post('/refresh')
  @HttpCode(200)
  async refreshToken(@Body() refreshData: RefreshTokenDto) {
    const authResponse = await authService.refreshToken(refreshData);

    return {
      data: authResponse,
      message: 'Token refreshed successfully',
    };
  }
}
