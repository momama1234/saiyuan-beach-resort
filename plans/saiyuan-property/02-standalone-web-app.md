---
status: todo
mode: hitl
---

# Phase 2: เว็บ Saiyuan (standalone) build + run ชี้ staging

**User stories**: ในฐานะลูกค้า ฉันต้องการเข้าเว็บ Saiyuan แล้วจองห้องได้ และ booking ไปขึ้นใต้ property Saiyuan

**Blocked by**: Phase 1 (ต้องมี propertyId + api key ของ staging)

## What to build

ยกเว็บ `apps/web-andalay` ออกมาเป็น repo เดี่ยวที่ `/Users/scott/Desktop/Saiyuan Beach Resort` แล้วทำให้ build + รันได้ (next dev บนเครื่อง คุยกับ backend staging):

1. `git init` repo ใหม่ใน `/Users/scott/Desktop/Saiyuan Beach Resort`, copy โค้ดจาก `apps/web-andalay`
2. inline-vendor เฉพาะที่ใช้จริง:
   - `@repo/shared` → `constants/pending-booking`, `constants/payment`, `constants/image`, `utils/rate-plan-discount`, `types/room-management`
   - `@repo/ui` → `icons`, `countdown-timer`
   - แก้ import `@repo/*` → path ในตัว (เช่น `@/shared/*`, `@/components/*`)
3. แทน `tsconfig` extends (`@repo/typescript-config/nextjs.json`) ด้วย config ที่ resolve แล้ว
4. ตัด Turborepo: `package.json` name = `web-saiyuan`, build = `next build`, แปลง catalog/workspace deps เป็น version ปกติ
5. ตั้ง `.env`:
   - `NEXT_PUBLIC_API_BASE_URL=https://dev-api.thaivis.com/`
   - `NEXT_PUBLIC_API_URL=https://dev-api.thaivis.com/v1`
   - `NEXT_PUBLIC_API_PUBLIC_KEY=<staging publicKey>`
   - `NEXT_PUBLIC_API_KEY=<staging apiKey>`
   - `PROPERTY_ID=<saiyuan staging id>` (ต้องตรงกับ propertyId ใน api key)
6. `pnpm install` + `pnpm dev` → เปิดเว็บได้ ดึงข้อมูล Saiyuan จาก staging
7. ทดสอบจองผ่าน UI 1 รายการ (ยังเป็น branding Andalay ได้)

## Acceptance criteria

- [ ] `next build` ผ่าน ไม่มี error เรื่อง `@repo/*` ที่หาไม่เจอ
- [ ] `pnpm dev` รันได้ หน้าแรกแสดงห้อง 3 ประเภทของ Saiyuan + ราคาถูกต้อง (ดึงจาก staging)
- [ ] จองผ่าน UI ได้ 1 รายการสำเร็จ
- [ ] booking ที่จองขึ้นในแอดมิน staging ใต้ property **Saiyuan** (ไม่ใช่ Andalay), `sourceId` = WEBSITE(2)
