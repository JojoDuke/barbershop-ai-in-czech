# Multi-Business Flow Update - Summary

## ✅ Changes Implemented

### 1. Category Rename: "Hair Salon" → "Barbershop"
- Updated all references throughout the codebase
- Changed category type from `hair_salon` to `barbershop`
- Updated translations (English + Czech)

### 2. New Conversation Flow

#### A. Standard Flow (User says "hi")
```
User: "hi"
  ↓
Bot: "Hi, I'm Bridget, your AI assistant...
     1. Barbershop - haircuts, styling, beard trims, grooming
     2. Physiotherapy - massage, rehabilitation, therapy"
  ↓
User: "1" (selects Barbershop)
  ↓
Bot: "Which barbershop would you like to book at?
     1. Rico Studio - Prague, Czech Republic
     2. [Future barbershop] - [Location]"
  ↓
User: "1" (selects Rico Studio)
  ↓
Bot: "Great! Here are the services at Rico Studio:
     • Haircut - 30 minutes
     • Beard Trim - 15 minutes
     ..."
  ↓
[Continue with normal booking flow]
```

#### B. Direct Booking Intent (Backward Compatible)
```
User: "I want a haircut today in the afternoon"
  ↓
Bot: [Auto-detects "barbershop" category]
     [Defaults to Rico Studio (isDefault: true)]
     [Shows afternoon slots for today]
     "For Haircut at Rico Studio on [date] in the afternoon..."
  ↓
[User picks time, provides contact, confirms]
```

**Key Point:** Direct booking intents skip category AND barbershop selection, defaulting to Rico Studio for backward compatibility.

### 3. Rico Studio as Default

In `src/businesses.ts`:
```typescript
{
  id: 'd709a085-8c00-4bea-af6c-438e5741521a',
  name: 'Rico Studio',
  category: 'barbershop',
  isDefault: true, // ← Default for direct bookings
  ...
}
```

**Function added:**
```typescript
getDefaultBusiness(category) // Returns Rico Studio for 'barbershop'
```

### 4. Cross-Barbershop Availability (Future Feature)

**Translations added** (not yet fully implemented):
```typescript
timeNotAvailableOtherShops: (businessName, otherBusinesses) => 
  `That time slot isn't available at ${businessName}.
   Would you like to:
   1. Choose another time at ${businessName}
   2. Check availability at ${otherBusinesses}`
```

**To implement:** When a time slot is unavailable, suggest checking other barbershops in the category.

## 📁 Files Modified

1. **src/businesses.ts**
   - Changed `hair_salon` → `barbershop`
   - Renamed business to "Rico Studio"
   - Added `isDefault` flag
   - Added `address` field
   - Added `getDefaultBusiness()` function

2. **src/translations.ts**
   - Changed `categoryHairSalon` → `categoryBarbershop`
   - Updated all text references
   - Added barbershop selection messages
   - Added cross-business availability messages

3. **src/chat.ts**
   - Updated category detection (`hair_salon` → `barbershop`)
   - Added `choose_business` step for barbershop selection
   - Default to Rico Studio for direct booking intents
   - Updated all category references

4. **src/session.ts**
   - Updated type: `hair_salon` → `barbershop`
   - Added `categoryBusinesses` field

5. **src/multi-business-helpers.ts**
   - Updated function signatures: `hair_salon` → `barbershop`

## 🎯 Test Scenarios

### Test 1: Standard Flow
```
Send: hi
Expected: See categories with "Barbershop" (not "Hair Salon")

Send: 1
Expected: See barbershop selection (currently only Rico Studio)

Send: 1
Expected: See services at Rico Studio
```

### Test 2: Direct Booking (Backward Compatible)
```
Send: I want a haircut today in the afternoon
Expected:
- Auto-detects barbershop category
- Defaults to Rico Studio
- Shows afternoon slots
- No barbershop selection step
```

### Test 3: Physiotherapy (Single Business)
```
Send: hi
Expected: See categories

Send: 2
Expected: Go directly to physiotherapy services (no business selection since only 1)
```

## 📋 Next Steps (Not Yet Implemented)

### 1. Add Second Barbershop
Currently only Rico Studio exists. To add a second barbershop:

```typescript
// In src/businesses.ts
{
  id: 'second-barbershop-id',
  name: 'Second Barbershop Name',
  category: 'barbershop',
  address: 'Address here',
  accessToken: '...',
  isLive: true,
  // Don't set isDefault - Rico Studio keeps that
}
```

### 2. Implement Cross-Barbershop Availability

When time not available:
```typescript
// In src/chat.ts, in the slot selection logic
if (slotNotAvailable && state.selectedCategory === 'barbershop') {
  const otherBarbershops = getBusinessesByCategory('barbershop')
    .filter(b => b.id !== state.selectedBusinessId);
  
  if (otherBarbershops.length > 0) {
    // Show option to check other barbershops
    const otherNames = otherBarbershops.map(b => b.name).join(', ');
    return t.timeNotAvailableOtherShops(state.selectedBusinessName, otherNames);
  }
}
```

### 3. Get Real Addresses from API

Currently addresses are placeholders. Fetch from Reservio API:
```typescript
const business = await getBusiness(businessId);
const address = formatAddress(business.data.attributes);
```

## 🚀 Ready to Test

The implementation is complete and ready for testing:

1. **Set READ_ONLY_MODE=true** in `.env`
2. **Start server:** `npm run dev`
3. **Test flows above**

## ⚠️ Important Notes

1. **Rico Studio is the default** - Direct booking intents ("I want haircut today") go to Rico Studio automatically
2. **Backward compatible** - Existing flow works exactly as before for direct intents
3. **Single barbershop currently** - Only Rico Studio configured, but ready for more
4. **Cross-barbershop suggestions** - Translations ready, logic not yet implemented

## 🎉 Summary

- ✅ "Hair Salon" renamed to "Barbershop"
- ✅ Barbershop selection step added (when multiple exist)
- ✅ Direct booking intents default to Rico Studio
- ✅ Backward compatibility maintained
- ✅ Ready for second barbershop to be added
- ⏳ Cross-barbershop availability suggestions (future)

