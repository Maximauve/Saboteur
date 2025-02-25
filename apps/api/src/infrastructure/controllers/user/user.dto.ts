import { PartialType } from "@nestjs/swagger";

import { RegisterDto } from "@/infrastructure/controllers/auth/auth-dto";

export class UpdatedUserDto extends PartialType(RegisterDto) {}