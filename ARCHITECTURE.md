# Technical Architecture - Courier App

## 1. Mimari Yaklasim
- Mobile-first, API-first, role-based platform
- Iki ayri mobil istemci: Sender App ve Courier App
- Ortak backend servisleri
- Finansal islemler icin transaction-safe tasarim

## 2. Teknoloji Yigini
1. Mobile
- React Native (Expo) + TypeScript
- Navigation: React Navigation
- Data fetching: TanStack Query
- Local state: Zustand
- Forms: React Hook Form + Zod

2. Backend
- NestJS (TypeScript)
- REST API (MVP), socket tabanli olaylar (canli takip)
- Background jobs: BullMQ

3. Data katmani
- PostgreSQL (ana veri tabani)
- Prisma ORM
- Redis (cache, queue, gecici oturum/OTP)

4. Storage ve entegrasyon
- S3 uyumlu obje depolama (paket/tahsilat foto)
- SMS gateway (OTP)
- Push bildirim (FCM)
- Odeme gateway (iyzico/PayTR)

## 3. Yuksek Seviye Bilesenler
- API Gateway (auth, rate limit, request tracing)
- Auth Service
- Order Service
- Dispatch Service
- Proof Service
- Payment/Wallet Service
- Pricing Service
- Support Service
- Notification Service

## 4. Veri Modeli (Ozet)
- users
- organizations
- courier_profiles
- courier_documents
- orders
- order_packages
- order_labels
- order_events
- order_proofs
- cancellations
- disputes
- payments
- wallets
- wallet_holds
- wallet_ledger
- pricing_rules
- city_coefficients
- support_tickets

## 5. Kritik Domain Akislari
## 5.1 Siparisten Teslimata
1. Gonderici siparis olusturur.
2. Fiyat engine ucreti hesaplar (boost dahil).
3. Dispatch servisi uygun kuryelere siparisi açar.
4. Kurye kabul ederken komisyon hold kontrolu yapilir.
5. Kurye alis ve teslim surecine gecer.
6. Teslimatta fotograf + GPS + OTP kontrol edilir.
7. Order status tamamlanir, ledger kesinlestirilir.

## 5.2 Komisyon Pre-Blocke
1. Kurye accept istegi gelir.
2. Wallet service transaction baslatir.
3. Yeterli bakiye varsa `wallet_holds` olusturur.
4. Siparis assign edilir.
5. Is sonucu kurala gore hold capture/release edilir.

## 6. Guvenlik
- JWT access + refresh token rotasyonu
- RBAC (sender_individual, sender_corporate, courier, admin)
- At-rest encryption (db disk) + in-transit TLS
- Hassas alanlar icin field-level masking (vergi no vb.)
- Audit trail: durum degisiklikleri ve finans hareketleri loglanir

## 7. Olceklenebilirlik
- Stateless API podlari (horizontal scaling)
- Redis cache ile sicak sorgularin hizlandirilmasi
- Queue ile asenkron islemler (bildirim, belge dogrulama)
- Sehir bazli rollout feature flag ile acilir

## 8. Gozlemlenebilirlik
- Merkezi log (requestId bazli)
- Metrikler: atama suresi, teslimat tamamlama, hata oranlari
- Alarm: odeme/OTP hatalari, queue birikmesi, API latency spike

## 9. Ortamlar
- dev, staging, prod
- CI/CD: test + migration + deploy pipeline
- Migration stratejisi: Prisma migration ve geriye uyumlu rollout

## 10. Monorepo Onerisi
- apps/sender-mobile
- apps/courier-mobile
- apps/api
- packages/shared-types
- packages/ui-kit
