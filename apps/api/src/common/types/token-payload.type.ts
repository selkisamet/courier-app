import { UserRole } from "./user-role.type";

export type TokenPayload = {
  sub: string;
  role: UserRole;
  phone: string;
};
