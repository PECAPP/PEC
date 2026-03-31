import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            findAllRooms: jest.fn(),
            findMessages: jest.fn(),
            getChatUsers: jest.fn(),
            createRoom: jest.fn(),
            sendMessage: jest.fn(),
            deleteMessage: jest.fn(),
            listClubs: jest.fn(),
            createClub: jest.fn(),
            submitClubJoinRequest: jest.fn(),
            listClubJoinRequests: jest.fn(),
            reviewClubJoinRequest: jest.fn(),
            postToClub: jest.fn(),
          },
        },
      ],
    }).overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
