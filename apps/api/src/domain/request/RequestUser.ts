import { type UserFromRequest } from "@/domain/model/user";

export interface RequestWithUser extends Request {
  user?: UserFromRequest
}