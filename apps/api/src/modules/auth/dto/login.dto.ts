export type LoginDto = {
  phone: string;
  password: string;
};

export type RefreshDto = {
  refreshToken: string;
};

export type VerifyPhoneOtpDto = {
  phone: string;
  otp: string;
};
