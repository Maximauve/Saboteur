import { ApiProperty } from '@nestjs/swagger';

import { Role } from '@/domain/model/role';
import { UserM } from '@/domain/model/user';

export class UserPresenter {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  createdDate: Date;
  @ApiProperty()
  updatedDate: Date;
  @ApiProperty()
  role: Role;  

  constructor(user: UserM) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.createdDate = user.createdDate;
    this.updatedDate = user.updatedDate;
    this.role = user.role;
  }
}
