import { ApiProperty } from "@nestjs/swagger";

export class RoomResponse {
  @ApiProperty()
  code: string;
}