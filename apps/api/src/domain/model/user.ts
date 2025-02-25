export class UserWithoutPassword {
  id: number;
  username: string;
}

export class UserM extends UserWithoutPassword {
  password: string;
}
