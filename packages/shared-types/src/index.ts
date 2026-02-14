export type UserRole = "sender_individual" | "sender_corporate" | "courier" | "admin";

export type PaymentType = "cash" | "online" | "corporate";
export type PayerType = "sender" | "receiver";

export type OrderStatus =
  | "created"
  | "published"
  | "accepted"
  | "picked_up"
  | "on_route"
  | "arrived"
  | "delivered"
  | "cancelled"
  | "disputed";

export type DeliveryProofType = "pickup_photo" | "delivery_photo" | "gps" | "otp";
