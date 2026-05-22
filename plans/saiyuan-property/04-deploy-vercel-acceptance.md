---
status: todo
mode: hitl
---

# Phase 4: Deploy Vercel + acceptance

**User stories**: ในฐานะลูกค้า ฉันต้องเข้าเว็บ Saiyuan แบบ public แล้วจองได้ และ booking ขึ้นถูก property; ในฐานะแอดมิน ฉันเห็นเฉพาะ booking ของ property ตัวเอง

**Blocked by**: Phase 2, Phase 3

## What to build

deploy เว็บ Saiyuan ขึ้น Vercel (ชี้ backend staging) แล้ว verify acceptance ครบ:

1. push repo `/Users/scott/Desktop/Saiyuan Beach Resort` ขึ้น git remote (org/บัญชีที่ตกลง)
2. สร้าง Vercel project ผูก repo (auto-detect Next.js)
3. ตั้ง Environment Variables บน Vercel ให้ตรงกับ `.env` เฟส 2 (5 ตัว, ชี้ `dev-api.thaivis.com`)
4. deploy → ได้ URL public ของ Vercel
5. (ถ้ามี domain) ผูก domain + ตรวจ CORS ฝั่ง backend ยอมรับ origin ใหม่
6. รัน acceptance E1-E3 บน URL Vercel
7. ตั้ง follow-up issue: ปิดช่องโหว่ `@Public()` ของ `/v1/api-key/generate` (B2)

## Acceptance criteria

- [ ] เว็บ Saiyuan เปิดได้จาก URL Vercel (public) แสดง branding Saiyuan + ห้อง/ราคาจาก staging
- [ ] **E1**: จองผ่านเว็บ Vercel → `booking.propertyId` = Saiyuan, `sourceId` = WEBSITE(2)
- [ ] **E2**: แอดมินสลับ working property ไป Saiyuan เห็น booking นั้น; สลับไป property อื่นไม่เห็น
- [ ] **E3**: จ่าย deposit ครบ → booking ขึ้น Confirmed อัตโนมัติ (guest channel)
- [ ] Andalay (dev) ยังทำงานปกติตลอด
- [ ] ตั้ง follow-up issue ปิด `@Public()` endpoint แล้ว
