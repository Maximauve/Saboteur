import { Controller, Post } from '@nestjs/common';

import { RoomService } from '@/room/service/room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('')
  createRoom() {
    try {
      this.roomService.createRoom();
    } catch (error) {
      console.error(error);
      // handle error
    }
  }
}
