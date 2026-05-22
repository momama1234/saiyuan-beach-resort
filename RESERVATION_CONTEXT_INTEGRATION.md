# Reservation Context Integration

## Overview

ระบบนี้ใช้ React Context API เพื่อแชร์ข้อมูลการจองระหว่าง `ReservationSection` (ในเมนู) และ `RoomContent` (ในหน้าห้อง) โดยไม่ต้องผ่าน URL parameters

## Architecture

### 1. ReservationContext (`/contexts/ReservationContext.tsx`)

**Features:**
- จัดการ state สำหรับ `dateRange`, `adults`, `children`
- ให้ functions สำหรับอัปเดต state
- มี utility function `generateBookingUrlWithReservation()` สำหรับสร้าง booking URL

**Key Functions:**
```typescript
// Context hooks
const { reservationData, setDateRange, setAdults, setChildren } = useReservation()

// URL generation with context data
const bookingUrl = generateBookingUrlWithReservation(roomClassId, reservationData)
```

### 2. ReservationSection (`/components/menu/ReservationSection.tsx`)

**Changes:**
- ใช้ `useReservation()` hook แทน local state
- อัปเดต state ผ่าน context functions
- ข้อมูลที่เลือกจะถูกเก็บใน global context

**State Management:**
```typescript
const { reservationData, setDateRange, setAdults, setChildren } = useReservation()
const { dateRange, adults, children } = reservationData
```

### 3. RoomContent (`/components/content/RoomContent.tsx`)

**Changes:**
- ใช้ `useReservation()` hook เพื่อเข้าถึงข้อมูลจาก context
- ใช้ `generateBookingUrlWithReservation()` แทนฟังก์ชันเดิม
- ปุ่ม "Book Now" จะใช้ข้อมูลที่เลือกใน ReservationSection

**Booking Logic:**
```typescript
const { reservationData } = useReservation()

const handleBooking = () => {
  const bookingUrl = generateBookingUrlWithReservation(roomClassId, reservationData)
  window.open(bookingUrl, '_blank')
}
```

### 4. Root Layout (`/app/layout.tsx`)

**Provider Setup:**
- เพิ่ม `<ReservationProvider>` ครอบคลุมทั้งแอป
- ทำให้ context สามารถเข้าถึงได้จากทุก component

## Booking URL Generation Logic

### Default Behavior (ไม่มีวันที่เลือก)
- **เวลาปัจจุบัน < 12:00**: Check-in = วันนี้, Check-out = พรุ่งนี้
- **เวลาปัจจุบัน >= 12:00**: Check-in = พรุ่งนี้, Check-out = มะรืนนี้
- **Default guests**: Adults = 2, Children = 0

### With Selected Data (มีวันที่เลือก)
- ใช้วันที่ที่เลือกใน ReservationSection
- ใช้จำนวนผู้เข้าพักที่เลือก
- สร้าง URL: `/reservations?roomClassId=123&checkIn=2024-02-10&checkOut=2024-02-15&adults=4&children=2`

## Testing

### Test Coverage
- **Component rendering**: ทดสอบการแสดงผล RoomContent
- **Default booking**: ทดสอบการสร้าง URL เมื่อไม่มีข้อมูลเลือก
- **Context integration**: ทดสอบการใช้ข้อมูลจาก context
- **Time-based logic**: ทดสอบ logic การเลือกวันที่ตามเวลา

### Test Files
- `RoomContent.test.tsx`: ครอบคลุมทั้ง default และ context scenarios

## Usage Flow

1. **User เลือกวันที่และจำนวนผู้เข้าพัก** ใน ReservationSection
2. **ข้อมูลถูกเก็บ** ใน ReservationContext
3. **User เข้าไปดูห้อง** และกดปุ่ม "Book Now"
4. **RoomContent อ่านข้อมูล** จาก context
5. **สร้าง booking URL** พร้อมข้อมูลที่เลือก
6. **เปิดหน้า reservations** ใน tab ใหม่

## Benefits

- ✅ **No URL dependency**: ไม่ต้องพึ่งพา URL parameters
- ✅ **Persistent data**: ข้อมูลคงอยู่ระหว่างการนำทาง
- ✅ **Better UX**: User ไม่ต้องเลือกวันที่ซ้ำ
- ✅ **Type safety**: TypeScript support ครบถ้วน
- ✅ **Testable**: มี test coverage ครอบคลุม
- ✅ **Timezone safe**: ใช้ date-fns เพื่อจัดการวันที่อย่างถูกต้อง
- ✅ **Clean code**: ใช้ utility functions จาก date-fns แทนการคำนวณเอง

## File Structure

```
apps/web-andalay/src/
├── contexts/
│   └── ReservationContext.tsx          # Context และ utility functions
├── components/
│   ├── menu/
│   │   └── ReservationSection.tsx      # Updated to use context
│   └── content/
│       ├── RoomContent.tsx             # Updated to use context
│       └── RoomContent.test.tsx        # Test coverage
└── app/
    └── layout.tsx                      # Provider setup
```

## Timezone Issue Fix

### ปัญหาเดิม
- ใช้ `toISOString().split('T')[0]` ทำให้วันที่เปลี่ยนเนื่องจาก UTC conversion
- เลือกวันที่ 25-31 แต่กลายเป็น 24-30 ใน URL

### การแก้ไข
- เปลี่ยนมาใช้ `date-fns` library
- ใช้ `format(date, 'yyyy-MM-dd')` แทน `toISOString()`
- ใช้ `addDays(date, 1)` แทนการคำนวณ milliseconds

### ข้อดีของ date-fns
```typescript
// ❌ เดิม - มีปัญหา timezone
const formatted = date.toISOString().split('T')[0]
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

// ✅ ใหม่ - ใช้ date-fns
const formatted = format(date, 'yyyy-MM-dd')
const tomorrow = addDays(today, 1)
```

## Future Enhancements

- เพิ่ม persistence ด้วย localStorage
- เพิ่ม validation สำหรับข้อมูลที่เลือก
- เพิ่ม loading states สำหรับ async operations
- เพิ่ม error handling สำหรับ invalid dates
- เพิ่ม locale support สำหรับ date formatting
