# Room Availability API Update - UI Changes

## Summary of Changes

The room availability API endpoint `/open/room-class-available` has been significantly updated to include **Rate Plans** and **Occupancy Options**. This document outlines all UI changes made to support the new data structure.

## New Response Structure

### Added Fields

```typescript
{
  id: number
  name: string
  basePrice: string
  numberOfAdults: number | null
  numberOfChildren: number | null
  numberOfRooms: number
  availableRooms: number        // NEW
  features: string[]            // NEW
  imageUrl: string
  ratePlans: RatePlan[]         // NEW
}

// New Types
type RatePlan = {
  id: number
  name: string
  isDefault: boolean
  occupancyOptions: OccupancyOption[]
}

type OccupancyOption = {
  id: number
  occupancy: number
  rate: number
  isDefault: boolean
}
```

## Files Changed

### 1. Type Definitions
**File:** `apps/web-andalay/src/types/room-management.ts`

**Changes:**
- Added `availableRooms` field to track remaining rooms
- Added `features` array for room amenities
- Added `ratePlans` array with nested `occupancyOptions`
- Changed `numberOfAdults` and `numberOfChildren` to nullable types

```typescript
export type AvailableRoomClass = {
  // ... existing fields
  availableRooms?: number        // NEW
  features?: string[]            // NEW
  ratePlans?: RatePlan[]         // NEW
  numberOfAdults?: number | null // UPDATED: now nullable
  numberOfChildren?: number | null // UPDATED: now nullable
}

// NEW TYPES
export type RatePlan = {
  id: number
  name: string
  isDefault: boolean
  occupancyOptions: OccupancyOption[]
}

export type OccupancyOption = {
  id: number
  occupancy: number
  rate: number
  isDefault: boolean
}
```

### 2. Rate Plan Selector Component
**File:** `apps/web-andalay/src/app/[locale]/reservations/components/RatePlanSelector.tsx` (NEW)

**Purpose:** 
Interactive component for selecting rate plans and occupancy options.

**Features:**
- Expandable/collapsible rate plan cards
- Visual indication of default/recommended plans
- Per-occupancy pricing display
- Automatic total calculation based on nights
- Selected state highlighting

**Usage:**
```tsx
<RatePlanSelector
  ratePlans={roomClass.ratePlans}
  selectedRatePlanId={selectedRatePlanId}
  selectedOccupancyId={selectedOccupancyId}
  onRatePlanSelect={handleRatePlanSelect}
  nights={nights}
/>
```

### 3. Room Card Component
**File:** `apps/web-andalay/src/app/[locale]/reservations/components/RoomCard.tsx`

**Major Changes:**

#### State Management
- Added `selectedRatePlanId` state
- Added `selectedOccupancyId` state
- Added computed values for selected rate plan and occupancy
- Added `nights` calculation

```typescript
const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(
  roomClass.ratePlans?.find(rp => rp.isDefault)?.id
)
const [selectedOccupancyId, setSelectedOccupancyId] = useState<number | undefined>(
  roomClass.ratePlans?.find(rp => rp.isDefault)?.occupancyOptions.find(opt => opt.isDefault)?.id
)
```

#### Layout Changes
- **Left Column:** Room features display (from API `features` array)
- **Right Column:** Rate plan selector + booking controls
- Added total price summary box when occupancy is selected
- Added available rooms counter
- Added "Limited availability" warning when rooms < 3

#### UI Improvements
- Features now displayed with checkmarks
- Occupancy info shown with user icon
- Better visual hierarchy with sections
- More prominent pricing display
- Clearer call-to-action buttons

## UI Components Structure

```
RoomClassCard
├── Room Images & Details (Left Side)
│   ├── Main Image
│   ├── Thumbnail Images
│   └── Static Room Details
│
└── Room Selection (Right Side)
    ├── Features Section
    │   ├── Features List (from API)
    │   └── Occupancy Info
    │
    └── Booking Section
        ├── Rate Plan Selector
        │   ├── Rate Plan Cards (collapsible)
        │   │   ├── Plan Name & Badge
        │   │   ├── Starting Price
        │   │   └── Occupancy Options
        │   │       └── Per-Guest Pricing
        │   │
        │   └── Total Price Summary
        │
        └── Booking Controls
            ├── Quantity Selector
            ├── SELECT/SELECTED Button
            └── Availability Counter
```

## Visual Changes

### Before
- Single price display based on `basePrice`
- Static occupancy numbers
- Generic room features (hardcoded)

### After
- Multiple rate plans with expandable options
- Selectable occupancy with per-guest pricing
- Dynamic features from API response
- Real-time total calculation
- Availability tracking
- Better visual feedback for selection

## Price Calculation Flow

1. **Initial State:**
   - Default rate plan selected (where `isDefault: true`)
   - Default occupancy option selected (where `isDefault: true`)

2. **User Selection:**
   - User expands a rate plan card
   - User selects an occupancy option
   - States updated: `selectedRatePlanId`, `selectedOccupancyId`

3. **Price Display:**
   - Per-night rate shown from occupancy option
   - Total calculated: `rate × nights`
   - Summary box shows breakdown

## Styling Updates

### New Color Scheme
- **Orange:** Primary actions (booking buttons)
- **Green:** Selected/confirmed states
- **Blue:** Recommended badges
- **Red:** Warnings (limited availability)

### Responsive Breakpoints
- **Mobile:** Stacked layout, full-width components
- **Desktop (lg):** Side-by-side layout with fixed widths

## API Integration Points

### Request
No changes to request parameters - still uses:
- `checkIn`
- `checkOut`
- `adults`
- `children`

### Response Handling
The hook `useRoomAvailability` automatically processes the new response structure. No changes needed in calling code.

### Backward Compatibility
- Falls back to `basePrice` if no rate plans available
- Handles null/undefined for all new optional fields
- Empty features array handled gracefully

## Testing Checklist

- [ ] Rate plan selection updates UI correctly
- [ ] Occupancy selection calculates price accurately
- [ ] Default selections work on component mount
- [ ] Quantity controls respect available rooms
- [ ] Mobile responsive layout works
- [ ] Empty states handled (no rate plans, no features)
- [ ] Multiple nights calculation correct
- [ ] Selected state persists during interaction

## Future Enhancements

### Potential Improvements
1. **Rate Plan Comparison:** Side-by-side comparison view
2. **Occupancy Presets:** Quick-select buttons for common occupancies
3. **Price Filtering:** Filter rooms by price range
4. **Availability Calendar:** Show date-specific availability
5. **Rate Plan Details:** Expandable section with terms & conditions

### Data Enhancements
1. **Cancellation Policies:** Per rate plan policies
2. **Inclusions:** Breakfast, amenities, etc.
3. **Room Images:** Multiple images per room
4. **Reviews:** Guest ratings and reviews

## Migration Notes

### For Developers
1. Update any custom price calculation logic to use `ratePlans`
2. Update tests to include new fields in mock data
3. Consider caching selected rate plan/occupancy in reservation context
4. Add analytics tracking for rate plan selections

### For Backend Team
1. Ensure `ratePlans` array is always included (can be empty)
2. Mark at least one rate plan as `isDefault: true`
3. Mark at least one occupancy option as `isDefault: true`
4. Validate that `availableRooms <= numberOfRooms`

## Performance Considerations

- Rate plan selector uses `useMemo` for computed values
- Expansion state managed locally to avoid re-renders
- Price calculations cached with `useMemo`
- Component uses React.FC for optimization

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly component structure
- Color contrast ratios meet WCAG standards

---

**Last Updated:** 2025-01-29  
**Version:** 1.0.0  
**Author:** AI Assistant

