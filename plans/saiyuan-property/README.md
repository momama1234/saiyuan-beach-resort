---
status: active
---

# Plan: Saiyuan Beach Resort — property ใหม่ + เว็บ booking (staging-only)

> Source PRD: `work/new_property/RESOLVED-PLAN.md` (+ `grill-me.md`)
> ปรับใหญ่: ตัด phase local ออกทั้งหมด — ใช้ **staging ที่มีอยู่** เป็น backend ตลอด

## เป้าหมาย
เพิ่มโรงแรม **Saiyuan Beach Resort** บน staging + เว็บ booking ของมันเอง (deploy บน Vercel) โดย booking ที่จองผ่านเว็บใหม่ต้องขึ้นถูก property ในแอดมิน

## Architectural decisions (ใช้ทุกเฟส)

- **Environment**: staging เท่านั้น (ไม่มี backend local)
  - backend API: `https://dev-api.thaivis.com/v1` · dev DB (shared)
  - แอดมิน UI: `https://dev-web.thaivis.com`
  - Prisma Studio (ดูข้อมูล): `https://dev-prisma.thaivis.com`
- **Multi-tenancy**: dev DB เดียว แยกด้วย `propertyId` (integer). Saiyuan = tenant rows ใหม่ใน DB เดิม
  - ⚠️ **dev DB เป็น shared** (Andalay dev ใช้อยู่) → ห้าม destructive/full-table ops, แตะเฉพาะ Saiyuan
- **Provisioning**: สร้าง property/ห้อง/rate ผ่าน **แอดมิน UI** (ผ่าน service layer) — **ไม่ใช้ Prisma seeder** (dev DB ต่อตรงจากแล็ปท็อปไม่ได้)
- **API key**: stateless, เข้ารหัส `{publicKey}:{propertyId}` ด้วย `API_PRIVATE_KEY` ของ staging
  - mint ผ่าน public endpoint: `POST https://dev-api.thaivis.com/v1/api-key/generate` body `{ "propertyId": "<id>" }` → คืน `{ propertyId, publicKey, apiKey }`
- **Property identity**: Saiyuan Beach Resort · THB · propertyType 1 · TZ Asia/Bangkok · lang en · 14:00/12:00 · VAT 7% · service 10% · deposit เปิด · bookingPrefix SYN · status DRAFT (open API ไม่กรอง status → ใช้งานได้ทันที; คุม go-live ที่การ publish domain Vercel)
- **ห้อง/ราคา**: per_room · Room Only · 1 RatePlan "Standard Rate" · ราคาเดียวคงที่
  | RoomClass | rooms | THB/คืน |
  |---|---|---|
  | Deluxe Garden View | 5 | 2,500 |
  | Deluxe Pool View | 4 | 3,200 |
  | Beachfront Suite | 2 | 5,500 |
  - rate plan ที่สร้างผ่าน service auto-seed `InventoryDailyRate` 500 วันที่ base price ให้เอง
- **เว็บ booking**: repo เดี่ยวที่ `/Users/scott/Desktop/Saiyuan Beach Resort` (package `web-saiyuan`), clone จาก `apps/web-andalay`
  - inline-vendor เฉพาะที่ใช้: `@repo/shared` (constants/pending-booking, constants/payment, constants/image, utils/rate-plan-discount, types/room-management) + `@repo/ui` (icons, countdown-timer)
  - แทน `@repo/typescript-config` extends, ตัด Turborepo → `next build`, deploy Vercel
  - env: `NEXT_PUBLIC_API_BASE_URL=https://dev-api.thaivis.com/`, `NEXT_PUBLIC_API_URL=https://dev-api.thaivis.com/v1`, `NEXT_PUBLIC_API_PUBLIC_KEY=<staging>`, `NEXT_PUBLIC_API_KEY=<staging>`, `PROPERTY_ID=<saiyuan staging id>` (PROPERTY_ID ต้องตรงกับ propertyId ใน api key)
- **Design**: clone ฟังก์ชัน/flow/โครงสร้างหน้า จาก Andalay 100% แต่ **re-skin ให้หน้าตาต่าง** — ไม่ให้ดูเหมือน Andalay
  - ทิศทาง: **Ocean Teal (modern minimal)** — BG `#FAF9F5`, primary `#0E7C86` (teal), accent `#E0A458` (ทองทราย), fonts Plus Jakarta Sans + Cormorant, radius `1rem`, โทนโปร่ง/สะอาด/ทะเล
  - เทียบ Andalay (ขาว+ส้ม, Geist/DM Serif, 0.65rem) → ต่างชัดทั้งสี/ฟอนต์/โครง
  - branding (ชื่อ/โลโก้/metadata) → Saiyuan · placeholder assets · locale en+th

## Phases

1. [01-provision-staging.md](./01-provision-staging.md) — Provision Saiyuan บน staging + mint key
2. [02-standalone-web-app.md](./02-standalone-web-app.md) — เว็บ Saiyuan (standalone) build+run ชี้ staging
3. [03-branding.md](./03-branding.md) — เปลี่ยน branding เป็น Saiyuan
4. [04-deploy-vercel-acceptance.md](./04-deploy-vercel-acceptance.md) — deploy Vercel + acceptance

## Follow-up (นอก scope plan นี้)
- ปิด/ใส่ auth ให้ `POST /v1/api-key/generate` (`@Public()` = ใครก็ mint key ให้ property ใดก็ได้) — B2
- แก้ `apps/backend/scripts/generate-api-keys.ts` ที่ generate private key ใหม่ทุกครั้ง (latent bug, ไม่ได้ใช้ในงานนี้แล้ว)
