# Cross-Shop Availability Checking Feature

## Overview

The bot now intelligently checks alternative barbershops when the default shop doesn't have the requested time slot available. This provides a seamless booking experience where users are automatically offered alternatives instead of hitting a dead end.

## Implementation: Option 2 (Smart Cross-Shop Checking)

### How It Works

1. **User makes a booking request** (e.g., "I want haircut today in the afternoon")
2. **Bot checks default barbershop first** (Rico Studio for backward compatibility)
3. **If no matching slots found:**
   - Bot automatically checks other barbershops in the same category
   - Matches service by name/synonym (e.g., "haircut" matches both "Střih" and "Strihani")
   - Filters slots by same time preferences (morning/afternoon/evening or specific time constraints)
4. **Bot presents alternatives** with preview of available times
5. **User can:**
   - Select alternative barbershop → See full availability → Book
   - Request "other times" → See all times at original barbershop

## Key Features

### 🔍 Intelligent Service Matching
- Matches services across different barbershops using AI
- Handles different names for same service:
  - "Střih" (Holičství 21) ↔ "Strihani" (Rico Studio)
  - "Holení hlavy pouze strojkem" ↔ "Strihani strojkem"
  - Works with English synonyms: "haircut", "cut", "trim"

### ⏰ Time Preference Preservation
- Maintains user's time preference across barbershops:
  - Morning (before 12 PM)
  - Afternoon (12 PM - 5 PM)
  - Evening (after 5 PM)
  - "After X time"
  - "Before X time"

### 🏪 Category-Aware Checking
- Only checks businesses within same category
- Barbershops only check other barbershops
- Physiotherapy clinics only check other therapy clinics

### 📱 Works in All Flows
- **Direct booking intents:** "I want haircut today afternoon"
- **Guided flow:** User selects barbershop → service → date/time → no slots → alternatives shown
- **Mid-conversation:** Works at any point when slots are requested

## User Experience Flow

### Scenario 1: Alternative Available

```
User: I want haircut today in the afternoon

Bot: [Checks Rico Studio - no afternoon slots]
     [Automatically checks Holičství 21 - finds slots]
     
     Rico Studio doesn't have afternoon slots available on Wednesday, 18 December 2024.
     
     But I found availability at:
     
     1. **Holičství 21**
        2:00 PM, 3:30 PM, 4:00 PM (+2 more)
     
     Reply with the number to see full availability, or say "other times" to see 
     different times at Rico Studio.

User: 1

Bot: Great! Here are available times for Střih at **Holičství 21** on 18 December:
     
     • 2:00 PM - 2:45 PM
     • 3:30 PM - 4:15 PM
     • 4:00 PM - 4:45 PM
     • 5:00 PM - 5:45 PM
     • 6:00 PM - 6:45 PM
     
     Reply with the time you want.

User: 2:00 PM

Bot: You picked: 2:00 PM - 2:45 PM for Střih.
     [Continues with booking at Holičství 21]
```

### Scenario 2: User Wants Original Shop

```
User: I want haircut today in the afternoon

Bot: Rico Studio doesn't have afternoon slots available...
     [Shows alternatives]

User: other times

Bot: Sure! Let me show you all available times at Rico Studio for Wednesday, 18 December 2024.
     
     • 9:00 AM - 9:30 AM
     • 10:00 AM - 10:30 AM
     • 11:30 AM - 12:00 PM
     
     Reply with the time you want.

User: 10:00 AM

Bot: You picked: 10:00 AM - 10:30 AM for Strihani.
     [Continues with booking at Rico Studio]
```

## Technical Implementation

### New Files/Functions

**`src/businesses.ts`** - Added:
```typescript
export function getAlternativeBusinesses(
  currentBusinessId: string, 
  category: 'barbershop' | 'physiotherapy'
): BusinessConfig[]
```
Returns businesses in same category, excluding current business.

**`src/chat.ts`** - Added:
```typescript
async function checkAlternativeBusinessAvailability(
  currentBusinessId: string,
  category: 'barbershop' | 'physiotherapy',
  serviceName: string,
  requestedDate: dayjs.Dayjs,
  timePreference: string | null,
  timeConstraint: { type: 'after' | 'before', time: string } | null | undefined
): Promise<{ business: BusinessConfig; service: any; slots: any[] }[]>
```
Core function that:
1. Gets alternative businesses
2. For each alternative:
   - Sets API context to that business
   - Fetches services
   - Matches service by name/synonym using AI
   - Fetches available slots
   - Filters by time preferences/constraints
3. Returns businesses with matching availability

### Updated Conversation Flow

Added new step: `choose_alternative`

**State tracking:**
```typescript
userState[from] = {
  step: "choose_alternative",
  alternativeOptions: [/* array of businesses with availability */],
  requestedDate: dayjs,
  timePreference: string | null,
  timeConstraint: { type, time } | null,
  selectedBusinessId: string,
  selectedBusinessName: string,
  selectedCategory: 'barbershop' | 'physiotherapy'
}
```

### Integration Points

Cross-shop checking is triggered in two places:

1. **Direct booking intent flow** (lines ~1215-1287 in `src/chat.ts`)
   - When user provides service + date + time on first message
   - Bot checks default business first
   - If no slots → checks alternatives

2. **Regular service selection flow** (lines ~1680-1755 in `src/chat.ts`)
   - When user selects service → date → time
   - Bot checks selected business
   - If no slots → checks alternatives

## Business Configuration

### Current Setup

```typescript
BUSINESSES = [
  {
    id: 'd709a085-8c00-4bea-af6c-438e5741521a',
    name: 'Holičství 21',
    category: 'barbershop',
    // ... API details
  },
  {
    id: 'ef525423-dabf-4750-bf11-dc5182d68695',
    name: 'Rico Studio',
    category: 'barbershop',
    isDefault: true,  // ← Used for direct booking intents
    // ... API details
  },
  {
    id: 'fc376586-8906-4c0a-8cd3-be382a3c4a89',
    name: 'Anatomic Fitness',
    category: 'physiotherapy',
    // ... API details
  }
]
```

### Default Business Behavior

- **Direct booking intents** default to business with `isDefault: true`
- **Guided flow** lets user explicitly choose barbershop
- Cross-shop checking only occurs when currently selected shop has no slots

## Console Logging

Added comprehensive logging for debugging:

```
❌ No slots found at Rico Studio, checking alternatives...
🔍 Checking alternative business: Holičství 21
  ✅ Found matching service: Střih
  🎯 Found 5 matching slots in Holičství 21
✅ Found 1 alternative(s) with availability
```

## Service Matching Examples

The AI service matcher handles these variations:

| User Input | Holičství 21 | Rico Studio |
|------------|--------------|-------------|
| "haircut" | Matches "Střih" | Matches "Strihani" |
| "cut" | Matches "Střih" | Matches "Strihani" |
| "fade" | Matches "Fade" | No match |
| "shave" | Matches "Holení hlavy" | Matches "Strihani strojkem" |
| "beard trim" | Matches "Úprava vousů" | No exact match |
| "střih" | Matches "Střih" | Matches "Strihani" |

## Testing

See `TESTING.md` for complete testing scenarios. Key tests:

1. ✅ Direct booking with no slots at default shop → Shows alternatives
2. ✅ User selects alternative → Books at alternative shop
3. ✅ User requests "other times" → Shows original shop's all slots
4. ✅ Works with time preferences (morning/afternoon/evening)
5. ✅ Works with time constraints (after X, before X)
6. ✅ Maintains correct business context throughout booking
7. ✅ Only checks within same category (no barbershop/physiotherapy mixing)

## Future Enhancements

Possible improvements:

1. **Distance-based sorting** - Show nearest alternative first
2. **Price comparison** - Show pricing differences between shops
3. **Wait time indication** - "Holičství 21 has slots in 2 hours"
4. **Preference learning** - Remember which shop user prefers
5. **Multi-date checking** - "No slots today, but both shops have availability tomorrow"
6. **Parallel checking** - Check all shops simultaneously for faster response
7. **Smart recommendations** - "Based on your location, Holičství 21 is 5 mins closer"

## Benefits

### For Users
- ✅ Never hit a dead end
- ✅ More booking options
- ✅ Faster appointment scheduling
- ✅ Transparent about availability across all locations
- ✅ User stays in control (can choose alternative or stick with original)

### For Business
- ✅ Reduces booking abandonment
- ✅ Fills capacity across all locations
- ✅ Better customer satisfaction
- ✅ More efficient resource utilization
- ✅ Captures bookings that would otherwise be lost

## Conclusion

The cross-shop availability checking feature significantly improves the booking experience by automatically offering alternatives when the preferred shop is unavailable. It maintains user context, intelligently matches services, and provides a seamless flow that increases successful bookings across all business locations.

