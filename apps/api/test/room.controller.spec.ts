import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from '@/infrastructure/controllers/room/room.controller';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';
import { UserFromRequest } from '@/domain/model/user';
import { JwtAuthGuard } from '@/infrastructure/common/guards/jwtAuth.guard';

describe('RoomController', () => {
  let controller: RoomController;
  let mockCreateRoomUseCaseProxy: Partial<UseCaseProxy<CreateRoomUseCases>>;
  let mockTranslationService: Partial<TranslationService>;

  const mockUser: UserFromRequest = {
    id: 'user-id-1',
    email: 'test@example.com',
    username: 'testuser'
  };

  const mockRoom = {
    code: 'ABC123',
    host: 'user-id-1',
    users: [mockUser]
  };

  beforeEach(async () => {
    mockCreateRoomUseCaseProxy = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockRoom)
      })
    };

    mockTranslationService = {
      translate: jest.fn().mockImplementation((key) => Promise.resolve(key))
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
          useValue: mockCreateRoomUseCaseProxy
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoomController>(RoomController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const result = await controller.createRoom(mockUser);

      expect(mockCreateRoomUseCaseProxy.getInstance).toHaveBeenCalled();
      expect(mockCreateRoomUseCaseProxy.getInstance && mockCreateRoomUseCaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser);
      
      expect(result).toEqual({ code: mockRoom.code });
    });

    it('should throw an error if room creation fails', async () => {
      mockCreateRoomUseCaseProxy.getInstance = jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue(new Error('Failed to create room'))
      });

      await expect(controller.createRoom(mockUser)).rejects.toThrow('Failed to create room');
      
      expect(mockCreateRoomUseCaseProxy.getInstance).toHaveBeenCalled();
      expect(mockCreateRoomUseCaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser);
    });
  });
});
