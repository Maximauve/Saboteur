import { type User } from "@/infrastructure/entities/user.entity";

export interface RequestWithUser extends Request {
  user?: User
}