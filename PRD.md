# PRD - Courier App

## 1. Urun Ozeti
Bu proje, Banabikurye benzeri ancak operasyonel guvenlik, finansal kontrol ve kurye deneyimi acisindan gelistirilmis bir kurye platformudur.

Platform 3 ana rolden olusur:
- Gonderici (Bireysel)
- Gonderici (Kurumsal)
- Kurye (Vergi levhasi zorunlu)

Mobil tarafta iki ayri uygulama bulunur:
- Gonderici uygulamasi (Bireysel + Kurumsal)
- Kurye uygulamasi

Web panel sonraki fazda (V2) devreye alinacaktir.

## 2. Problem ve Hedef
### Temel Problemler
- Teslimat kaniti zayif
- Kurye iptal/itiraz mekanizmasi yetersiz
- Odemede taraf ve yontem belirsizligi
- Komisyon tahsilati garantisiz
- Canli destek yetersiz
- Paket icerigi ve hassasiyet bilgisi eksik
- Sehir bazli olcekleme modeli eksik

### Urun Hedefleri
- Teslimat suistimalini azaltmak
- Kuryenin adil ve kanitli sekilde is yonetmesini saglamak
- Platform komisyonunu tahsilatta garanti altina almak
- Bireysel + kurumsal gondericiyi ayni altyapida desteklemek
- 81 ile yayilabilecek sehir-katsayi tabanli operasyon modeli kurmak

## 3. Basari Kriterleri (KPI)
- Basarisiz/itirazli teslimat orani: <%2
- Siparis atama suresi (median): <3 dk
- OTP + fotograf + GPS ile tamamlanan teslimat orani: >%95
- Kurye kaynakli haksiz ceza itiraz kabul orani: <%5
- Ilk 90 gunde tekrar siparis orani: >%30

## 4. Kapsam
## 4.1 MVP Kapsami
1. Rol bazli kayit/giris
- Bireysel gonderici
- Kurumsal gonderici
- Kurye (vergi levhasi yukleme + manuel/yarim otomatik onay)

2. Siparis olusturma
- Alis/teslimat adresleri
- Zorunlu paket fotografi
- Agirlik/boyut bilgisi
- Hassasiyet etiketleri
- Kuryeye not
- Odemeyi yapan taraf secimi (gonderici/alici)
- Odeme tipi secimi (nakit/online/cari)

3. Kurye is akis ekranlari
- Uygun siparis listesi
- VIP/Boost etiketi
- Ise teklif/kabul
- Paket teslim alma ve dagitim sureci

4. Teslimat dogrulamasi
- Kurye teslimat fotografi
- GPS koordinati
- Aliciya SMS OTP (4 hane)
- OTP dogrulama ile teslim tamamlama

5. Iptal/itiraz
- Kurye tarafinda kosullu iptal nedenleri
- Kanit yukleme (foto/GPS)
- Itiraz kaydi

6. Emanet/komsuya birak modu
- Alici onayi
- Komsu adi/daire bilgisi
- Fotograf kaniti

7. Hibrit odeme + komisyon mantigi
- Nakit, online, cari
- Kurye net kazancinin gosterimi
- Kurye komisyonu pre-blocke (cuzdan hold)

8. Destek
- WhatsApp Business yonlendirmesi
- Uygulama ici destek talebi kaydi

## 4.2 V2 Kapsami
- Admin web panel (operasyon + finans + itiraz)
- Kurumsal musteri icin toplu siparis API
- Gelismis kampanya/fiyat kurallari
- Otomatik fraud skorlama
- Rota optimizasyonu ve tahmini teslimat modeli

## 5. Roller ve Yetkiler
1. Bireysel Gonderici
- Tekil siparis olusturur
- Nakit veya online odeme seceneklerini kullanir

2. Kurumsal Gonderici
- Cari hesap ile siparis acabilir
- Fatura/raporlama goruntuler

3. Kurye
- Vergi levhasi ile kayit olur
- Siparis kabul eder, teslim eder, kanit yukler
- Cuzdan ve net kazancini gorur

4. Operasyon/Admin (V2)
- Kurye onayi
- Iptal/itiraz degerlendirme
- Sehir katsayi/fiyat kurali yonetimi

## 6. Is Kurallari
1. Kurye onboardingi
- Vergi levhasi olmayan kurye aktif olamaz.

2. Komisyon pre-blocke
- Kurye siparisi kabul etmeden once gerekli komisyon kadar bakiye/hold uygun olmalidir.

3. Teslimat kapanis kuralı
- Teslim tamamlandi sayilmasi icin fotograf + GPS + OTP dogrulamasi gerekir.
- Komsuya birak modunda OTP yerine alici onayi + komsu bilgisi + fotograf zorunlu olabilir (operasyon politikasi ile secilir).

4. Iptal sorumluluk modeli
- Kanitlanan kuryeden bagimsiz hatalarda ceza kuryeye yansitilmaz.

5. Odeme sorumlulugu
- Siparis aninda odemeyi yapan taraf ve odeme tipi kilitlenir.

## 7. Ana Kullanici Akislari
1. Gonderici siparis akisi
- Kayit/Giris -> Siparis olustur -> Paket detay/foto -> Odeme ayari -> Kurye atanmasi -> Canli takip -> Teslim kaniti

2. Kurye akisi
- Kayit/Giris -> Vergi levhasi onay -> Uygun siparisler -> Siparis kabul -> Alis -> Teslimat dogrulama -> Cuzdana yansima

3. Problem akisi
- Adreste yok / yanlis adres / tasinamaz yuk -> Iptal nedeni + kanit -> Operasyon inceleme -> Sonuc

## 8. Non-Functional Gereksinimler
- API p95 yanit suresi: <500ms (kritik okuma endpointleri)
- Veri butunlugu: finans kayitlari icin ACID transaction
- Guvenlik: JWT + refresh token + role-based auth
- Dosya guvenligi: signed URL + erisim denetimi
- Denetim izi: tum kritik aksiyonlarda event log

## 9. Riskler ve Onlemler
- OTP ulasmama riski -> fallback yeniden gonderim + sesli OTP opsiyonu
- Nakit tahsilat uyuşmazliklari -> kanit zorunlulugu + ledger audit
- Sahte belge ile kurye kaydi -> belge dogrulama + manuel onay

## 10. Fazlama ve Takvim (Ozet)
- Faz 1 (6-8 hafta): MVP mobil + backend
- Faz 2 (4-6 hafta): Admin web + raporlama + otomatizasyon
