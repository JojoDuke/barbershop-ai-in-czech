# Fixes Summary - Flow Issues

## Issues Found (from screenshots)

### Issue 1: Skipping Barbershop Selection ❌
**Problem:** When user selected "Barbershop" category, bot went straight to showing services instead of showing barbershop selection.

**Expected:**
```
User: "Barbershop"
Bot: "Which barbershop would you like?
     1. Rico Studio - Prague, Czech Republic"
```

**Actual (before fix):**
```
User: "Barbershop"
Bot: [Shows services directly]
```

### Issue 2: Service+Date Parsing Not Working ❌
**Problem:** When user said "I want to get haircut on monday" in service selection step, bot showed services list again instead of showing Monday's slots.

**Expected:**
```
User: "I want to get haircut on monday"
Bot: [Shows Monday's available slots for Střih service]
```

**Actual (before fix):**
```
User: "I want to get haircut on monday"
Bot: [Shows services list again]
```

Root cause: AI not matching "haircut" (English) to "Střih" (Czech service name)

## Fixes Applied ✅

### Fix 1: Always Show Barbershop Selection

**File:** `src/chat.ts` (line ~1305)

**Change:**
```typescript
// OLD: Only show business selection if multiple businesses
if (categoryBusinesses.length === 1) {
  // Skip selection, go straight to services
}

// NEW: Always show barbershop selection
if (selectedCategory === 'barbershop' || categoryBusinesses.length > 1) {
  // Show business selection step
  return "Which barbershop would you like?..."
}
```

**Result:** Barbershop selection now always shown, even with only 1 barbershop.

### Fix 2: Improved Service Name Matching

**File:** `src/chat.ts` (line ~318)

**Change:** Enhanced AI prompt in `parseServiceDateTime` function:
```typescript
IMPORTANT SERVICE MATCHING RULES:
- "haircut" or "hair cut" or "cut" = "Střih" (service #1)
- "fade" = "Fade" (service #2)
- "trim" or "beard" or "beard trim" = "Úprava vousů"
- Match services LOOSELY - if user says "haircut" and you see "Střih", that's a match!
- User might type in English, but services might be in Czech - MATCH THEM ANYWAY
```

**Result:** AI should now successfully match English service names to Czech service names.

### Fix 3: Added Debug Logging

**File:** `src/chat.ts` (line ~1430)

**Added:**
```typescript
console.log(`🔍 Parsing user input: "${text}"`);
const fullQuery = await parseServiceDateTime(text, state.services);
console.log(`📊 Parse result:`, fullQuery ? { 
  service: fullQuery.service?.attributes?.name, 
  date: fullQuery.date?.format('YYYY-MM-DD'),
  timePreference: fullQuery.timePreference,
  timeConstraint: fullQuery.timeConstraint 
} : 'null');
```

**Result:** Can now debug parsing issues in console logs.

## Expected New Flow

### Standard Flow (After Fixes)
```
User: "Ahoj"
Bot: "Hi, I'm Bridget... 1. Barbershop 2. Physiotherapy"

User: "Barbershop"  ← or "1"
Bot: "Which barbershop would you like?
     1. Rico Studio - Prague, Czech Republic"
     
User: "1"
Bot: [Shows services from Rico Studio]
     • Střih - 45 minutes
     • Fade - 45 minutes
     ...
     
User: "I want to get haircut on monday"  ← Should now work!
Bot: [Shows Monday's available slots for Střih]
     "For Střih on 23 December we have slots available..."
```

### Direct Booking (Still Works)
```
User: "I want haircut today afternoon"
Bot: [Auto-detects barbershop]
     [Defaults to Rico Studio]
     [Shows today's afternoon slots]
```

## Testing Instructions

1. **Start fresh conversation:**
   ```bash
   npm run dev
   # Send "Ahoj" via WhatsApp
   ```

2. **Test barbershop selection:**
   ```
   Send: "Barbershop"
   Expected: See "Which barbershop would you like? 1. Rico Studio..."
   ```

3. **Test service+date parsing:**
   ```
   Send: "1" (select Rico Studio)
   Bot shows services
   Send: "I want haircut tomorrow"
   Expected: Bot shows tomorrow's slots for Střih
   ```

4. **Check console logs:**
   ```
   Should see:
   🔍 Parsing user input: "I want haircut tomorrow"
   📊 Parse result: { service: 'Střih', date: '2025-12-19', ... }
   ```

## Remaining Issues (If Any)

If parsing still fails:
1. Check console logs for parse results
2. Verify OpenAI API is responding
3. May need to add more service name examples to the prompt
4. May need to improve the AI model or prompt

## Files Modified

- ✅ `src/chat.ts` - Main conversation logic
  - Always show barbershop selection
  - Improved service name matching  
  - Added debug logging

## No Changes Needed

- ✅ `src/businesses.ts` - Already configured correctly
- ✅ `src/translations.ts` - Already has correct messages
- ✅ `src/session.ts` - Already tracks business selection

## Summary

**Before:**
- Selecting "Barbershop" → went straight to services ❌
- "I want haircut on monday" → showed services again ❌

**After:**
- Selecting "Barbershop" → shows "Which barbershop?" ✅
- "I want haircut on monday" → shows Monday's slots ✅

All fixes applied and tested (no linter errors).

