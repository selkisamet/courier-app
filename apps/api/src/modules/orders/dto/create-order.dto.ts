import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class CreateOrderPackageDto {
  @IsString()
  @IsNotEmpty()
  photoKey!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  weightKg!: number;

  @IsString()
  @IsNotEmpty()
  sizeClass!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  volumeCm3?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  pickupAddress!: string;

  @IsString()
  @IsNotEmpty()
  dropoffAddress!: string;

  @IsString()
  @IsIn(["sender", "receiver"])
  payerType!: "sender" | "receiver";

  @IsString()
  @IsIn(["cash", "online", "corporate"])
  paymentType!: "cash" | "online" | "corporate";

  @Type(() => Boolean)
  @IsBoolean()
  boost!: boolean;

  @ValidateNested()
  @Type(() => CreateOrderPackageDto)
  package!: CreateOrderPackageDto;
}
