# SEO Schema Utilities สำหรับโรงแรม

คู่มือการใช้งาน SEO Schema utilities ที่ช่วยปรับปรุง SEO ของเว็บไซต์โรงแรมตาม [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)

## 🚨 สำคัญ: Server-Side SEO

**SEO structured data ควรทำใน Server-Side เสมอ!**

Search engine bots ต้องการข้อมูลที่พร้อมใช้งานในการ crawl ครั้งแรก ไม่ใช่ข้อมูลที่สร้างด้วย JavaScript หลังจาก page load

## ไฟล์ที่สำคัญ

- **`lib/seo-server.ts`** - ⭐ **ใช้อันนี้หลัก!** Server-side utilities (แนะนำสำหรับ SEO)
- **`lib/seo-schema.ts`** - หลักของระบบ, มี functions สำหรับสร้าง structured data
- **`components/SEOSchema.tsx`** - React component สำหรับแทรก schema ลงในหน้า (ใช้กับ Server Components)
- **`constants/hotel.ts`** - ข้อมูลโรงแรมสำหรับใช้ใน schema
- **`components/examples/ServerSideExamples.tsx`** - ⭐ ตัวอย่างการใช้งานแบบ Server-Side (แนะนำ)
- **`hooks/useSEOSchema.ts`** - ⚠️ Client-side hooks (ใช้เฉพาะกรณีพิเศษ)

## การใช้งานพื้นฐาน

### 1. อัปเดตข้อมูลโรงแรม

แก้ไขไฟล์ `constants/hotel.ts`:

```typescript
export const HOTEL_INFO: HotelInfo = {
  name: "ชื่อโรงแรมของคุณ",
  description: "คำอธิบายโรงแรม",
  url: "https://yourdomain.com",
  telephone: "+66-XX-XXX-XXXX",
  email: "info@yourhotel.com",
  address: {
    streetAddress: "ที่อยู่ของโรงแรม",
    locality: "เมือง",
    region: "จังหวัด", 
    postalCode: "รหัสไปรษณีย์",
    country: "TH"
  },
  // ... ข้อมูลอื่น ๆ
}
```

### 2. ใช้งานในหน้าต่าง ๆ (Server-Side Approach ⭐ แนะนำ)

#### หน้าหลัก (Homepage) - Server Component

```tsx
import SEOSchema from '@/components/SEOSchema'
import { getHomepageSchemas } from '@/lib/seo-server'
import { HOTEL_INFO } from '@/constants/hotel'

// Server Component - ดีที่สุดสำหรับ SEO
export default async function HomePage() {
  // สร้าง schema ที่ server ก่อนส่งให้ client
  const schemas = getHomepageSchemas()

  return (
    <>
      {/* Schema ถูกสร้างที่ server และส่งใน initial HTML */}
      <SEOSchema schema={schemas} />
      
      <main>
        <h1>ยินดีต้อนรับสู่ {HOTEL_INFO.name}</h1>
        <p>พักผ่อนแบบไทยแท้...</p>
      </main>
    </>
  )
}
```

#### หน้าห้องพัก - Server Component

```tsx
import SEOSchema from '@/components/SEOSchema'
import { getRoomsPageSchemas } from '@/lib/seo-server'

export default async function RoomsPage() {
  // Server-side schema generation
  const schemas = getRoomsPageSchemas('/rooms')

  return (
    <>
      <SEOSchema schema={schemas} />
      
      <main>
        <h1>ห้องพักและสวีท</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* เนื้อหาห้องพัก */}
        </div>
      </main>
    </>
  )
}
```

#### หน้า FAQ - Server Component

```tsx
import SEOSchema from '@/components/SEOSchema'
import { getFAQPageSchemas } from '@/lib/seo-server'
import { HOTEL_FAQ } from '@/constants/hotel'

export default async function FAQPage() {
  // Server-side schema generation
  const schemas = getFAQPageSchemas()

  return (
    <>
      <SEOSchema schema={schemas} />
      
      <main>
        <h1>คำถามที่พบบ่อย</h1>
        <div className="space-y-6">
          {HOTEL_FAQ.questions.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-700">{item.answer}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
```

#### หน้าบทความ/บล็อก - Server Component

```tsx
import SEOSchema from '@/components/SEOSchema'
import { getArticlePageSchemas } from '@/lib/seo-server'
import type { ArticleInfo } from '@/lib/seo-schema'

export default async function BlogPost({ 
  article 
}: { 
  article: {
    title: string
    slug: string
    content: string
    excerpt: string
    publishDate: string
    updateDate?: string
    author: string
    authorSlug: string
    featuredImage: string
  }
}) {
  const articleInfo: ArticleInfo = {
    headline: article.title,
    description: article.excerpt,
    url: `https://thaivis.breathoftravels.com/blog/${article.slug}`,
    datePublished: article.publishDate,
    dateModified: article.updateDate,
    author: {
      name: article.author,
      url: `https://thaivis.breathoftravels.com/author/${article.authorSlug}`
    },
    publisher: {
      name: "Andalay Hotel & Restaurant",
      logo: "https://thaivis.breathoftravels.com/logo.png"
    },
    image: article.featuredImage,
    articleBody: article.content
  }

  // Server-side schema generation
  const schemas = getArticlePageSchemas(articleInfo)

  return (
    <>
      <SEOSchema schema={schemas} />
      
      <article>
        <header>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="text-gray-600 mb-6">
            <span>โดย {article.author}</span> • 
            <time dateTime={article.publishDate}>
              {new Date(article.publishDate).toLocaleDateString('th-TH')}
            </time>
          </div>
        </header>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </>
  )
}
```

### 3. ใช้งาน Schema อัตโนมัติตาม URL - Server Component

```tsx
import SEOSchema from '@/components/SEOSchema'
import { getSchemasByPathname } from '@/lib/seo-server'

// Server Component ที่สร้าง schema อัตโนมัติตาม pathname
export default async function AutoSchemaPage({ 
  params 
}: { 
  params: { pathname: string } 
}) {
  // Server-side schema generation ตาม URL path
  const schemas = getSchemasByPathname(params.pathname)

  return (
    <>
      <SEOSchema schema={schemas} />
      
      <main>
        <h1>หน้าที่มี Schema อัตโนมัติ</h1>
        <p>Schema ถูกสร้างอัตโนมัติตาม URL path: {params.pathname}</p>
      </main>
    </>
  )
}
```

## Schema Types ที่รองรับ

### 1. **LocalBusiness/LodgingBusiness Schema**
- สำหรับ: หน้าหลัก, หน้าติดต่อ, หน้าเกี่ยวกับเรา
- ข้อมูล: ชื่อ, ที่อยู่, เบอร์โทร, คะแนน, รีวิว, สิ่งอำนวยความสะดวก

### 2. **Organization Schema**
- สำหรับ: ทุกหน้า (ควรใส่ใน layout)
- ข้อมูล: ข้อมูลองค์กร, โลโก้, social media

### 3. **Article Schema**
- สำหรับ: หน้าบล็อก, ข่าวสาร, คู่มือ
- ข้อมูล: หัวข้อ, เนื้อหา, ผู้เขียน, วันที่เผยแพร่

### 4. **FAQ Schema**
- สำหรับ: หน้า FAQ, คำถาม-คำตอب
- ข้อมูล: คำถามและคำตอบ

### 5. **BreadcrumbList Schema**
- สำหรับ: ทุกหน้าที่มี breadcrumb navigation
- ข้อมูล: เส้นทางการนำทาง

### 6. **WebSite Schema**
- สำหรับ: หน้าหลัก
- ข้อมูล: ข้อมูลเว็บไซต์, search action

## การทดสอบ Schema

### 1. ใช้เครื่องมือของ Google
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Markup Validator**: https://validator.schema.org/

### 2. Debug Component (สำหรับการพัฒนา)

```tsx
import { SEOSchemaDebug } from '@/components/SEOSchema'

// ใช้ในขณะพัฒนาเพื่อดู schema ที่สร้างขึ้น
<SEOSchemaDebug schema={hotelSchema} />
```

## การปรับแต่งเพิ่มเติม

### เพิ่ม Review ใหม่

แก้ไขใน `constants/hotel.ts`:

```typescript
export const HOTEL_INFO: HotelInfo = {
  // ...
  reviews: [
    {
      author: "ชื่อผู้รีวิว",
      rating: 5,
      text: "ข้อความรีวิว",
      date: "2024-01-15"
    }
    // เพิ่มรีวิวอื่น ๆ
  ]
}
```

### เพิ่ม FAQ ใหม่

```typescript
export const HOTEL_FAQ = {
  questions: [
    {
      question: "คำถามใหม่?",
      answer: "คำตอบของคำถามใหม่"
    }
    // เพิ่มคำถามอื่น ๆ
  ]
}
```

### เพิ่ม Social Media

```typescript
export const HOTEL_INFO: HotelInfo = {
  // ...
  socialMedia: {
    facebook: "https://facebook.com/yourhotel",
    instagram: "https://instagram.com/yourhotel",
    twitter: "https://twitter.com/yourhotel",
    youtube: "https://youtube.com/yourhotel"
  }
}
```

## ข้อดีของการใช้ Structured Data

1. **ปรับปรุงการแสดงผลใน Google Search** - Rich snippets, star ratings, contact info
2. **เพิ่มโอกาสติด Featured Snippets**
3. **ปรับปรุง Local SEO** - สำหรับการค้นหาโรงแรมในพื้นที่
4. **เพิ่มการแสดงผลใน Google Maps**
5. **รองรับ Voice Search** - การค้นหาด้วยเสียง

## หมายเหตุ

- อัปเดตข้อมูลใน `constants/hotel.ts` ให้ตรงกับข้อมูลจริงของโรงแรม
- ทดสอบ schema ด้วย Google Rich Results Test ก่อนเผยแพร่
- เพิ่ม schema เฉพาะที่เกี่ยวข้องกับเนื้อหาของหน้านั้น ๆ
- อัปเดต schema เมื่อมีข้อมูลโรงแรมเปลี่ยนแปลง

## ตัวอย่างการใช้งานเพิ่มเติม

## Server-Side Utilities ที่ใช้ได้ (แนะนำ ⭐)

```tsx
// นำเข้าจาก seo-server.ts
import { 
  getHomepageSchemas,      // หน้าหลัก
  getRoomsPageSchemas,     // หน้าห้องพัก  
  getContactPageSchemas,   // หน้าติดต่อ
  getFAQPageSchemas,       // หน้า FAQ
  getArticlePageSchemas,   // หน้าบทความ
  getAboutPageSchemas,     // หน้าเกี่ยวกับเรา
  getSchemasByPathname,    // Schema อัตโนมัติตาม URL
  getLayoutSchemas         // Schema พื้นฐานสำหรับ layout
} from '@/lib/seo-server'
```

## ⚠️ Client-Side Hooks (ใช้เฉพาะกรณีพิเศษ)

Client-side hooks ใน `hooks/useSEOSchema.ts` ควรใช้เฉพาะเมื่อ:

1. **ต้องการอัปเดต schema หลังจาก page load** (เช่น เมื่อข้อมูลเปลี่ยนแปลงแบบ dynamic)
2. **ทำงานกับ Client Components ที่ไม่สามารถใช้ Server Components ได้**
3. **สร้างฟีเจอร์แบบ interactive ที่ต้องแก้ไข schema**

```tsx
// ❌ ไม่แนะนำสำหรับ SEO ทั่วไป
'use client'
import { useHotelSchema } from '@/hooks/useSEOSchema'

// ✅ ใช้แทนสำหรับ SEO 
import { getHomepageSchemas } from '@/lib/seo-server'
```

## สรุป: วิธีใช้ที่ถูกต้อง

### ✅ ทำแบบนี้ (แนะนำ)
```tsx
// Server Component - ดีสำหรับ SEO
export default async function MyPage() {
  const schemas = getHomepageSchemas()
  return (
    <>
      <SEOSchema schema={schemas} />
      {/* เนื้อหา */}
    </>
  )
}
```

### ❌ อย่าทำแบบนี้สำหรับ SEO
```tsx
// Client Component - ไม่ดีสำหรับ SEO
'use client'
export default function MyPage() {
  const schemas = useHotelSchema(HOTEL_INFO)
  return (
    <>
      <SEOSchema schema={schemas} />
      {/* เนื้อหา */}
    </>
  )
}
```

## ตัวอย่างการใช้งานเพิ่มเติม

- **Server-side examples (แนะนำ)**: `components/examples/ServerSideExamples.tsx`
- **Client-side examples (กรณีพิเศษ)**: `components/examples/SEOSchemaExamples.tsx`
