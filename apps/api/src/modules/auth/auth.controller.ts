import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto, VerifyPhoneOtpDto } from "./dto/login.dto";
import { RegisterBaseDto, RegisterCorporateDto, RegisterCourierDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/sender-individual")
  registerSenderIndividual(@Body() body: RegisterBaseDto) {
    return this.authService.registerSenderIndividual(body);
  }

  @Post("register/sender-corporate")
  registerSenderCorporate(@Body() body: RegisterCorporateDto) {
    return this.authService.registerSenderCorporate(body);
  }

  @Post("register/courier")
  registerCourier(@Body() body: RegisterCourierDto) {
    return this.authService.registerCourier(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post("refresh")
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body);
  }

  @Post("logout")
  logout() {
    return { success: true };
  }

  @Post("verify-phone-otp")
  verifyPhoneOtp(@Body() body: VerifyPhoneOtpDto) {
    return {
      phone: body.phone,
      verified: body.otp.length === 4,
    };
  }
}
