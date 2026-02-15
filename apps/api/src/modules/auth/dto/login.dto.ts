import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone!: string;

  @IsString()
  @Matches(/^[0-9]{4}$/)
  otp!: string;
}
