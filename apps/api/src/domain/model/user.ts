import { type Role } from "@/domain/model/role";

export class UserWithoutPassword {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdDate: Date;
}

export class UserM extends UserWithoutPassword {
  password: string;
}



