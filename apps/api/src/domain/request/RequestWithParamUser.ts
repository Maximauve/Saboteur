import { type User } from "@/infrastructure/entities/user.entity";

export interface RequestWithParamUser extends Request {
  params: {
    userId: string
  };
  user?: User;
}