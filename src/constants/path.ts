/**
 * API Paths for public/guest-facing endpoints
 */

/**
 * Reservations API
 */
export const OPEN_RESERVATIONS_API_PATH = '/open/reservations'

/**
 * Room Class Availability API
 */
export const OPEN_ROOM_CLASS_AVAILABLE_API_PATH = '/open/room-class-available'

/**
 * Property Info API
 */
export const OPEN_PROPERTY_INFO_API_PATH = '/open/property-info'

/**
 * Room Classes List API
 */
export const OPEN_ROOM_CLASSES_LIST_API_PATH = '/open/room-classes-list'

/**
 * Gallery Categories API
 */
export const OPEN_GALLERY_CATEGORIES_API_PATH = '/open/gallery-categories'

/**
 * Gallery Categories API with property categoryType filter
 */
export const OPEN_GALLERY_CATEGORIES_PROPERTY_API_PATH = '/open/gallery-categories?categoryType=property'

/**
 * Property Gallery Images API
 */
export const OPEN_PROPERTY_GALLERY_IMAGES_API_PATH = '/open/property-gallery-images'

/**
 * Property Video Gallery API
 */
export const OPEN_PROPERTY_VIDEOS_API_PATH = '/open/property-videos'

/**
 * Images by Category API - use with category ID
 * Example: `${OPEN_IMAGES_BY_CATEGORY_API_PATH}/${categoryId}`
 */
export const OPEN_IMAGES_BY_CATEGORY_API_PATH = '/open/images-by-category'

/**
 * Pre-checkin: search by surname or email
 * GET /open/pre-checkin/search?q=
 */
export const OPEN_PRE_CHECKIN_SEARCH_API_PATH = '/open/pre-checkin/search'

/**
 * Pre-checkin: send OTP to email
 * POST /open/pre-checkin/send-otp { bookingId, email }
 */
export const OPEN_PRE_CHECKIN_SEND_OTP_API_PATH = '/open/pre-checkin/send-otp'

/**
 * Pre-checkin: verify OTP
 * POST /open/pre-checkin/verify-otp { bookingId, email, code } -> { verified }
 */
export const OPEN_PRE_CHECKIN_VERIFY_OTP_API_PATH = '/open/pre-checkin/verify-otp'

/**
 * Pre-checkin (no OTP): verify by booking code + lastName or email
 * POST /open/pre-checkin/verify-booking-code { bookingCode, lastName?, email? } -> { verified, bookingId, booking }
 */
export const OPEN_PRE_CHECKIN_VERIFY_BOOKING_CODE_API_PATH = '/open/pre-checkin/verify-booking-code'

/**
 * Pre-checkin: create/update guest for booking (requires Bearer token from verify-otp)
 * POST /open/pre-checkin/booking/:bookingId/guest
 */
export const OPEN_PRE_CHECKIN_BOOKING_GUEST_API_PATH_PREFIX = '/open/pre-checkin/booking'

/**
 * Pre-checkin: OCR document scan (ID card / passport)
 * POST /open/pre-checkin/ocr/document with multipart file
 */
export const OPEN_PRE_CHECKIN_OCR_DOCUMENT_API_PATH = '/open/pre-checkin/ocr/document'

/**
 * Active Promotions API
 */
export const OPEN_PROMOTIONS_API_PATH = '/open/promotions'

/**
 * Supported Languages API
 */
export const OPEN_LANGUAGES_API_PATH = '/open/languages'
