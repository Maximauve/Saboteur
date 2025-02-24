import { IsNotEmpty } from 'class-validator';

export class RoomCreatedDto {
  @IsNotEmpty({ message: "L'hôte ne peut pas être vide" })
  host: string;

  @IsNotEmpty({ message: "L'hôte ID ne peut pas être vide" })
  userId: string;
}
