export type RegisterBaseDto = {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
};

export type RegisterCorporateDto = RegisterBaseDto & {
  organizationName: string;
  organizationTaxNumber: string;
};

export type RegisterCourierDto = RegisterBaseDto & {
  taxNumber: string;
  cityCode: string;
  vehicleType?: string;
};
