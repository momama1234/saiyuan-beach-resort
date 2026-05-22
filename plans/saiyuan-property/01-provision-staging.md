---
status: todo
mode: hitl
---

# Phase 1: Provision Saiyuan บน staging + mint key

**User stories**: ในฐานะเจ้าของระบบ ฉันต้องการให้โรงแรม Saiyuan + ห้อง + ราคา มีอยู่จริงบน staging และมี API key ที่เว็บใช้เชื่อมได้

## What to build

สร้าง property Saiyuan ครบชุดบน staging ผ่าน **แอดมิน UI** (`https://dev-web.thaivis.com`) — ผ่าน service layer ทั้งหมด ไม่แตะ DB ตรง:

1. ล็อกอินแอดมิน staging
2. สร้าง property "Saiyuan Beach Resort" (THB, propertyType 1, TZ Asia/Bangkok, lang en, 14:00/12:00, VAT 7%, service 10%, deposit เปิด, bookingPrefix SYN) ที่ `/property-management/create`
3. สลับ working property → Saiyuan (TeamSwitcher)
4. สร้าง RoomClass ×3 (numberOfRooms 5/4/2 → ระบบสร้าง Room ให้อัตโนมัติ) ราคา base 2,500 / 3,200 / 5,500
5. สร้าง RatePlan "Standard Rate" (per_room, Room Only) → ระบบ auto-seed ราคา 500 วัน
6. (ถ้าจำเป็น) ตรวจ/ปรับราคาในปฏิทิน `/inventory`
7. จด **propertyId** ของ Saiyuan (จาก URL / property switcher / Prisma Studio)
8. mint API key: `POST https://dev-api.thaivis.com/v1/api-key/generate` body `{ "propertyId": "<id>" }` → เก็บ `publicKey` + `apiKey`

⚠️ ห้ามทำ destructive op ใดๆ บน dev DB — แตะเฉพาะ Saiyuan ห้ามแตะ Andalay

## Acceptance criteria

- [ ] property Saiyuan ปรากฏในแอดมิน staging พร้อม 3 RoomClass และจำนวน Room รวม 11
- [ ] RatePlan "Standard Rate" มีและมีราคา (InventoryDailyRate) ครอบคลุมช่วงวันที่จะทดสอบจอง
- [ ] เรียก `GET https://dev-api.thaivis.com/v1/open/property-info` ด้วย header api key ของ Saiyuan → คืนข้อมูล Saiyuan (ไม่ใช่ Andalay)
- [ ] เรียก open availability ด้วย key Saiyuan → เห็นห้อง 3 ประเภทพร้อมราคา
- [ ] Andalay dev ยังทำงานปกติ (ไม่กระทบ)
- [ ] บันทึก propertyId + publicKey + apiKey ไว้ใช้เฟส 2
