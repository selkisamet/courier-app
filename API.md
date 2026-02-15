# API Endpoint List - MVP

Base URL: `/api/v1`
Auth: Bearer JWT

## 1. Auth
- `POST /auth/register/sender-individual`
- `POST /auth/register/sender-corporate`
- `POST /auth/register/courier`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/verify-phone-otp`

## 2. Courier Onboarding
- `POST /couriers/documents/tax-certificate`
- `GET /couriers/me/status`
- `PATCH /couriers/me/vehicle`
- `GET /couriers/me/wallet`
- `GET /couriers/me/wallet/ledger`

## 3. Orders (Sender)
- `POST /orders`
- `GET /orders/:orderId`
- `GET /orders`
- `POST /orders/:orderId/cancel-request`
- `POST /orders/:orderId/leave-with-neighbor`

### 3.1 Create Order Payload (Ozet)
```json
{
  "pickup": { "address": "...", "lat": 0, "lng": 0 },
  "dropoff": { "address": "...", "lat": 0, "lng": 0 },
  "package": {
    "photoKey": "s3-key",
    "weightKg": 2.3,
    "size": "M",
    "labels": ["fragile", "upright", "no_wet"],
    "note": "Zile basmayin"
  },
  "payerType": "sender",
  "paymentType": "cash",
  "boost": true
}
```

## 4. Orders (Courier)
- `GET /courier/orders/available`
- `POST /courier/orders/:orderId/accept`
- `POST /courier/orders/:orderId/reject`
- `POST /courier/orders/:orderId/picked-up`
- `POST /courier/orders/:orderId/on-route`
- `POST /courier/orders/:orderId/arrived`

## 5. Delivery Proof
- `POST /orders/:orderId/proofs/photo`
- `POST /orders/:orderId/proofs/gps`
- `POST /orders/:orderId/proofs/otp/send`
- `POST /orders/:orderId/proofs/otp/verify`
- `POST /orders/:orderId/complete`

## 6. Cancellation & Dispute
- `POST /orders/:orderId/courier-cancel`
- `POST /orders/:orderId/disputes`
- `GET /orders/:orderId/disputes`

### 6.1 Courier Cancel Payload (Ozet)
```json
{
  "reason": "wrong_address",
  "proofPhotoKey": "s3-key",
  "proofGps": { "lat": 0, "lng": 0 }
}
```

## 7. Pricing
- `POST /pricing/quote`
- `GET /pricing/city-coefficients`

## 8. Payments & Wallet
- `POST /payments/intent`
- `POST /payments/webhook`
- `GET /orders/:orderId/payment-summary`
- `GET /couriers/me/wallet`
- `POST /couriers/me/wallet/topup-intent`
- `GET /couriers/me/wallet/holds`

## 9. Support
- `POST /support/tickets`
- `GET /support/tickets/:ticketId`
- `GET /support/channels`

## 10. Notifications
- `POST /notifications/devices`
- `DELETE /notifications/devices/:deviceId`
- `GET /notifications`

## 11. Admin (V2)
- `GET /admin/couriers/pending-approval`
- `POST /admin/couriers/:courierId/approve`
- `POST /admin/disputes/:disputeId/resolve`
- `PATCH /admin/pricing/city-coefficients/:cityId`

## 12. Durum Kodlari ve Domain Hatalari (Ozet)
- `400` validation_error
- `401` unauthorized
- `403` forbidden_role
- `404` not_found
- `409` state_conflict (or. siparis zaten atandi)
- `422` business_rule_violation (or. yetersiz komisyon bakiyesi)
- `500` internal_error
