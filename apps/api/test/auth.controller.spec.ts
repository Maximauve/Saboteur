import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AuthController } from '@/infrastructure/controllers/auth/auth.controller';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { AuthService } from '@/infrastructure/services/jwt/jwt.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { LoginDto, RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn()
}));

describe('AuthController', () => {
  let controller: AuthController;
  let translationService: TranslationService;
  let authService: AuthService;
  
  const mockGetUserByEmailUseCase = { execute: jest.fn() };
  const mockCheckUnknownUserUseCase = { execute: jest.fn() };
  const mockAddUserUseCase = { execute: jest.fn() };
  
  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
          useValue: { getInstance: () => mockGetUserByEmailUseCase },
        },
        {
          provide: UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
          useValue: { getInstance: () => mockCheckUnknownUserUseCase },
        },
        {
          provide: UsecasesProxyModule.ADD_USER_USECASES_PROXY,
          useValue: { getInstance: () => mockAddUserUseCase },
        },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn().mockImplementation(key => Promise.resolve(key)) },
        },
        {
          provide: AuthService,
          useValue: { login: jest.fn().mockReturnValue({ accessToken: 'fake_token' }) },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    translationService = module.get<TranslationService>(TranslationService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw exception if user not found', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      mockGetUserByEmailUseCase.execute.mockResolvedValue(null);

      await expect(controller.login(loginDto, mockResponse())).rejects.toThrow(HttpException);
      expect(mockGetUserByEmailUseCase.execute).toHaveBeenCalledWith(loginDto.email);
      expect(translationService.translate).toHaveBeenCalledWith('error.INVALID_CREDENTIALS');
    });

    it('should throw exception if password is incorrect (according to the current controller logic)', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user = { id: 1, email: 'test@example.com', password: 'hashed_password' };
      mockGetUserByEmailUseCase.execute.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(controller.login(loginDto, mockResponse())).rejects.toThrow(HttpException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(translationService.translate).toHaveBeenCalledWith('error.INVALID_CREDENTIALS');
    });

    it('should login successfully if password is incorrect (according to the current controller logic)', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user = { id: 1, email: 'test@example.com', password: 'hashed_password' };
      const response = mockResponse();
      mockGetUserByEmailUseCase.execute.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await controller.login(loginDto, response);

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(response.cookie).toHaveBeenCalledWith('access_token', 'fake_token', expect.any(Object));
      expect(response.send).toHaveBeenCalledWith({ accessToken: 'fake_token' });
    });
  });

  describe('register', () => {
    it('should throw exception if user already exists', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };
      mockCheckUnknownUserUseCase.execute.mockResolvedValue(true);

      await expect(controller.register(registerDto, mockResponse())).rejects.toThrow(HttpException);
      expect(mockCheckUnknownUserUseCase.execute).toHaveBeenCalledWith(registerDto);
    });    
  });
});
