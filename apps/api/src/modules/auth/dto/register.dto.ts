import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterBaseDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterCorporateDto extends RegisterBaseDto {
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsString()
  @IsNotEmpty()
  organizationTaxNumber!: string;
}

export class RegisterCourierDto extends RegisterBaseDto {
  @IsString()
  @IsNotEmpty()
  taxNumber!: string;

  @IsString()
  @IsNotEmpty()
  cityCode!: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
