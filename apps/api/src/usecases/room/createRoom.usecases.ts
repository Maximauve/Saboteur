import { type ILogger } from '@/domain/logger/logger.interface';
import { type Room } from '@/domain/model/room';
import { type UserFromRequest, type UserRoom } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class CreateRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(user: UserFromRequest): Promise<Room> {
    const host: UserRoom = {
      username: user.username,
      userId: user.id,
      isHost: true
    };
    const room: Room = {
      code: Math.floor(100_000 + Math.random() * 900_000).toString(),
      host: host,
      users: [],
      started: false,
      currentRound: 0,
    };
    
    room.code = await this.generateUniqueRoomCode();
    const values = [
      'code',
      room.code.toString(),
      'host',
      JSON.stringify(host),
      'users',
      JSON.stringify(room.users),
      'started',
      room.started.toString(),
      'currentRound',
      room.currentRound.toString(),
    ];

    await this.roomRepository.setRoom(room.code, values);
    await this.roomRepository.setRound(room.code, 0, ['users', JSON.stringify([host])]);
    return room;
  }

  private generateUniqueRoomCode = async (): Promise<string> => {
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    if (await this.roomRepository.doesRoomExists(code)) {
      return this.generateUniqueRoomCode();
    }
    return code;
  };
}
