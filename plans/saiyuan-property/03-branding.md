---
status: todo
mode: hitl
---

# Phase 3: Visual redesign (re-skin ให้ต่างจาก Andalay)

**User stories**: ในฐานะลูกค้า ฉันต้องรู้สึกว่าเว็บ Saiyuan เป็นแบรนด์ของตัวเอง หน้าตาไม่เหมือน Andalay (ไม่ใช่แค่เปลี่ยนโลโก้)

**Blocked by**: Phase 2

## What to build

re-skin เว็บให้หน้าตา **ต่างจาก Andalay พอสมควร** โดย **คงฟังก์ชัน / flow / โครงสร้างหน้า เดิมไว้ 100%**:

1. **Design system**: เปลี่ยน color palette + typography (fonts) ใน `globals.css` / theme config (Tailwind) → ทิศทางดีไซน์ของ Saiyuan
2. **Hero / landing**: จัด layout + imagery ใหม่ ให้ first impression ต่างจาก Andalay
3. **Component styling**: ปุ่ม / การ์ด / spacing / มุมโค้ง / เงา / border → สไตล์ Saiyuan
4. **Branding**: ชื่อ/โลโก้/favicon/OG/metadata → Saiyuan (`layout.tsx`, `[locale]/layout.tsx`, `constants/hotel.ts`)
5. **Assets**: รูป hero/gallery/โลโก้ ของ Saiyuan (placeholder ถ้ายังไม่มีของจริง)
6. **คงไว้ไม่แตะ**: routes, booking flow/steps, ฟอร์ม, การดึงข้อมูล/API, logic ทั้งหมด

### ทิศทางดีไซน์ที่เคาะแล้ว: **Ocean Teal — modern minimal** 🌊

| token | ค่า |
|---|---|
| background | `#FAF9F5` (ขาว/แซนด์อ่อน) |
| primary | `#0E7C86` (เทอร์คอยส์/ทะเลเข้ม) |
| accent | `#E0A458` (ทองทราย) |
| text/foreground | `#14302E` |
| font (sans) | Plus Jakarta Sans |
| font (display) | Cormorant |
| radius | `1rem` (นุ่มกว่า Andalay 0.65) |
| mood | โปร่ง สะอาด ทะเล ร่วมสมัย โครงนุ่ม โล่ง |

ต่างจาก Andalay ชัด: ส้ม→เทอร์คอยส์, Geist/DM Serif→Plus Jakarta/Cormorant, มุมโค้งนุ่มขึ้น, hero โปร่งขึ้น
(แปลงเป็น `oklch` ใน `globals.css` ตอน implement; ค่าด้านบนเป็น sRGB อ้างอิง)

## Acceptance criteria

- [ ] เปิดเทียบกับ Andalay แล้วเห็นเป็น "คนละแบรนด์" ชัดเจน (สี/ฟอนต์/hero/สไตล์ component ต่าง) ไม่ใช่แค่เปลี่ยนโลโก้
- [ ] booking flow + ทุกฟีเจอร์ยังทำงานครบเหมือนเฟส 2 (re-skin ไม่ทำ flow พัง)
- [ ] ไม่เหลือคำว่า "andalay" (case-insensitive) ใน branding/metadata (ยกเว้นที่จงใจ)
- [ ] แสดงผลถูกต้องทั้ง locale en/th + responsive (มือถือ/เดสก์ท็อป)
