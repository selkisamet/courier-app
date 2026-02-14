import { Request } from "express";
import { TokenPayload } from "./token-payload.type";

export type AuthenticatedRequest = Request & {
  user: TokenPayload;
};
