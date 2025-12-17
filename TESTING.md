# Testing Guide for Multi-Business AI Bot

This guide will help you test all the features of the multi-business booking bot.

## 🆕 Multi-Business Mode

The bot now supports **multiple businesses** across different categories:
- **Hair Salon**: Barbershop services (haircuts, beard trims, styling)
- **Physiotherapy**: Therapy and wellness services (massage, rehabilitation)

Users are greeted by **Bridget**, an AI assistant who helps them choose a category and book appointments.

## ⚠️ READ-ONLY MODE (Important for Testing)

**CRITICAL**: The bot is connected to **LIVE booking systems**. To prevent accidental bookings during testing:

### Enable Read-Only Mode

Set this in your `.env` file:

```env
READ_ONLY_MODE=true
```

When enabled:
- ✅ Bot shows all services and availability
- ✅ Users can go through the full booking flow
- ✅ All booking details are logged
- ❌ **NO actual bookings are created** in the live systems
- 📋 Mock confirmation message is shown instead

### Disable for Production

Only set to `false` when you're ready to create real bookings:

```env
READ_ONLY_MODE=false
```

## 🚀 Quick Start

### 1. Environment Setup

Make sure your `.env` file has all required variables:

```env
# Database (optional - not used for in-memory user persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/barbershop

# OpenAI
OPENAI_API_KEY=sk-...

# Multi-Business Mode
READ_ONLY_MODE=true  # SET TO TRUE FOR TESTING!

# Business configurations are now in src/businesses.ts
# (No longer need RESERVIO_API_KEY, BUSINESS_ID in .env)

# Timezone
BUSINESS_TIMEZONE=Europe/Prague
RESERVIO_TIMEZONE=Europe/Prague

# Server
PORT=4000
```

**Note**: Business configurations (API keys, business IDs) are now managed in `src/businesses.ts` instead of environment variables.

### 2. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:4000` (or your configured PORT).

### 3. Expose Your Server (for WhatsApp testing)

You need to expose your local server to the internet so Twilio can send webhooks.

**Option A: Using ngrok (Recommended)**
```bash
# Install ngrok if you haven't: https://ngrok.com/download
ngrok http 4000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and use it in Twilio.

**Option B: Using other tunneling services**
- Cloudflare Tunnel
- LocalTunnel
- Serveo

## 📱 Testing via WhatsApp

### Setup Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to: **Messaging > Try it out > Send a WhatsApp message**
3. Configure your WhatsApp Sandbox or Business Number
4. Set webhook URL to: `https://your-ngrok-url.ngrok.io/whatsapp`
5. Set HTTP method to `POST`

### 🆕 New Feature: Direct Booking Intent Detection

The bot now intelligently detects when you want to book right from your first message and skips the greeting to get you booking faster!

**How it works:**

| Your First Message | Old Behavior | New Behavior ✨ |
|-------------------|--------------|-----------------|
| `hi` or `hello` | Shows greeting | Shows greeting (unchanged) |
| `I want a haircut` | Shows greeting → Then you say "haircut" | **Skips greeting** → Asks for date directly |
| `I need a haircut tomorrow` | Shows greeting → You say "haircut" → You say "tomorrow" | **Skips greeting** → Shows tomorrow's slots immediately |
| `Book me a trim tomorrow morning` | Shows greeting → Multiple steps | **Skips greeting** → Shows morning slots for tomorrow |
| `I want a haircut Friday after 3pm` | Shows greeting → Multiple steps → Shows ALL Friday slots | **Skips greeting** → Shows **only** slots after 3pm → Message says "after 3:00 PM" |

**Benefits:**
- ⚡ Faster booking for users who know what they want
- 🎯 Direct path to appointment scheduling
- 💬 More natural conversation flow
- ⏰ Smart time filtering (after X, before X, morning/afternoon/evening)
- 🌍 Works in both English and Czech

### Test Scenarios

#### ✅ Test 0: Multi-Business Category Selection (NEW)
**Send:** `hi` or `hello`

**Expected:**
- Bot introduces itself as "Bridget, your AI assistant"
- Shows category options:
  - 1. Hair Salon - haircuts, styling, beard trims, grooming
  - 2. Physiotherapy - massage, rehabilitation, therapy
- Asks what type of service you're looking for

**Follow-up:**
- Send: `1` or `hair salon`
- **Expected:** Bot shows available hair salon services
- Send: `2` or `physiotherapy`
- **Expected:** Bot shows available physiotherapy services

#### ✅ Test 0b: Auto Category Detection (NEW)
**Send:** `I want a haircut` (on first message)

**Expected:**
- Bot automatically detects "hair salon" category
- Skips category selection
- Goes directly to showing hair salon services or asking for date

**Send:** `I need a massage` (on first message)

**Expected:**
- Bot automatically detects "physiotherapy" category
- Skips category selection
- Goes directly to showing physiotherapy services

#### ✅ Test 1: Enhanced Greeting (Legacy Single-Business Mode)
**Send:** `hi` or `hello`

**Expected (if multi-business enabled):**
- Bot introduces as Bridget and shows categories

**Expected (if single-business mode):**
- Bot explains its capabilities
- Shows list of available services
- Message should mention: "I can help you: Check service availability, Book appointments, Get business information"

#### ✅ Test 1b: Direct Booking Intent (NEW)
**Send:** `I want to book a haircut` or `I need a haircut tomorrow` or `Can I book a beard trim?`

**Expected:**
- Bot skips the greeting entirely
- Goes directly to booking flow based on what you mentioned:
  - If service only mentioned: Asks for date
  - If service + date mentioned: Shows available slots for that date
  - If service + date + time preference (morning/afternoon/evening): Shows filtered slots
- No greeting message shown

**Test variations:**
- `I want a haircut` → Skips greeting, asks for date
- `I need a haircut tomorrow` → Skips greeting, shows tomorrow's slots
- `Book me for a trim tomorrow morning` → Skips greeting, shows morning slots for tomorrow
- `chci si zarezervovat střih` (Czech) → Skips greeting, asks for date

#### ✅ Test 1c: Cross-Shop Availability Checking (NEW - Option 2 Implementation)
**Scenario:** When Rico Studio doesn't have the requested time slot, the bot automatically checks other barbershops.

**Send:** `I want haircut today in the afternoon` (assuming Rico Studio has no afternoon slots)

**Expected:**
- Bot checks Rico Studio first (the default)
- If no afternoon slots at Rico Studio, bot automatically checks Holičství 21
- Bot shows message: "Rico Studio doesn't have afternoon slots available on [date]. But I found availability at:"
- Lists alternative barbershop(s) with their available slots:
  ```
  1. **Holičství 21**
     2:00 PM, 3:30 PM, 4:00 PM (+2 more)
  ```
- Bot asks: "Reply with the number to see full availability, or say 'other times' to see different times at Rico Studio."

**Test User Selections:**
1. **Select alternative shop:** Reply `1`
   - Expected: Shows full list of slots from Holičství 21
   - User can select a time and complete booking at that shop
   
2. **Request other times at original shop:** Reply `other times`
   - Expected: Shows all available slots at Rico Studio for that day (not just afternoon)

**Edge Cases:**
- If NO barbershops have the requested time → Shows regular "no slots available" message
- Works for both direct booking intents and regular flow
- Maintains context of which shop user ultimately books at

**Test variations:**
- `I want haircut on Monday morning` (if Rico Studio closed mornings)
- `Book me for a fade tomorrow after 5pm` (if only one shop has evening slots)

#### ✅ Test 1d: Time Constraints - "After X" / "Before X"
**Send:** `I want to get a haircut on Friday, after 3pm`

**Expected:**
- Bot skips greeting
- Shows **only** slots that start at or after 3:00 PM
- Message says "For Strihani on 12 December **after 3:00 PM** we have slots available"
- Does NOT show all slots starting from 12:00 PM

**Test variations:**
- `I need a haircut tomorrow after 3pm` → Shows only slots after 3:00 PM tomorrow, message says "after 3:00 PM"
- `Book me Friday after 15:00` → Shows only slots after 3:00 PM (24-hour format), message says "after 3:00 PM"
- `haircut tomorrow before 2pm` → Shows only slots before 2:00 PM, message says "before 2:00 PM"
- `I want a trim on Monday after 5pm` → Shows only evening slots after 5:00 PM, message says "after 5:00 PM"
- `střih zítra po 15` (Czech: haircut tomorrow after 3pm) → Shows slots after 3:00 PM, message says "po 15:00"

**How it works:**
- "after 3pm" → Only shows slots starting at 3:00 PM or later + message mentions "after 3:00 PM"
- "before 2pm" → Only shows slots starting at 2:00 PM or earlier + message mentions "before 2:00 PM"
- Works with both 12-hour (3pm) and 24-hour (15:00) formats
- The bot explicitly mentions the time constraint in the response
- Works in both English and Czech

#### ✅ Test 2: Business Info Request
**Send:** `what are your hours?` or `where are you located?` or `otevírací doba` (Czech)

**Expected:**
- Bot displays business address, hours, and contact info
- Asks if you'd like to book a service

**Try at different points:**
- Right after greeting
- During service selection
- After selecting a time slot

#### ✅ Test 3: AI-Powered Service Matching
**Send:** Various service name variations:
- `haircut` (exact match)
- `hair cut` (with space)
- `střih` (Czech for haircut)
- `cut` (partial)
- `beard` (should match "Beard Trim" if available)
- `vlasy` (Czech for hair)

**Expected:**
- Bot correctly matches service names even with variations
- If multiple matches, asks for clarification
- If no match, shows available services

#### ✅ Test 4: User Info Persistence
**First booking:**
1. Complete a full booking with name and email
2. Note: `John Doe, john@example.com`

**Second booking (same phone number):**
1. Send: `hi` to start new booking
2. Select service and time
3. **Expected:** Bot should say "Welcome back, John!" and ask to confirm saved email
4. Reply: `yes`
5. **Expected:** Skips contact info step, goes straight to confirmation

**Update info:**
1. When asked to confirm saved info, reply: `no`
2. **Expected:** Bot asks for updated name and email

#### ✅ Test 5: Back-Stepping Detection
**Scenario:**
1. Select service: `haircut`
2. Select date: `tomorrow`
3. Select time: `10:00 AM`
4. Bot asks for name and email
5. **Instead of providing contact info, send:** `Actually I want Wednesday 11am` or `Actually chci středa 11`

**Expected:**
- Bot detects you want to change time
- Asks for confirmation: "I see you want to change to Wednesday 11am. Should I find Wednesday slots instead?"
- Reply: `yes`
- The bot shows Wednesday slots

#### ✅ Test 6: Multi-Venue Support (if configured)
**Setup:** Add multiple business IDs to `.env`:
```env
BUSINESS_IDS=business_id_1,business_id_2
```

**Send:** `hi`

**Expected:**
- Bot shows list of venues with addresses
- Asks you to select a venue by number
- After selection, continues with service selection for that venue

#### ✅ Test 7: Off-Track Detection
**During booking flow, send:**
- `what's the weather?`
- `tell me a joke`
- `how are you?`

**Expected:**
- Bot gently guides you back: "I'm here to help you book an appointment. Would you like to see our available services?"

#### ✅ Test 8: Complex Availability Questions
**Send:**
- `I want haircut today in the afternoon`
- `What is the availability of [service name]?`
- `When will be haircut available?`
- `What business has haircut in my area?` (if multi-venue)

**Expected:**
- Bot parses service + date/time/location
- Shows matching services and availability
- Continues booking flow

#### ✅ Test 9: Full Booking Flow (Multi-Business)
**Complete end-to-end test:**
1. `hi` → See Bridget greeting and category options
2. `1` or `hair salon` → Select hair salon category
3. `haircut` → Select service
4. `tomorrow` → Select date
5. `10:00 AM` → Select time
6. `John Doe, john@example.com` → Provide contact (first time)
7. `yes` → Confirm booking
8. **Expected (READ_ONLY_MODE=true):** Test mode confirmation message
9. **Expected (READ_ONLY_MODE=false):** Real booking confirmation message

**Second booking (should use saved info):**
1. `hi` → See category options
2. `2` or `physiotherapy` → Select physiotherapy category
3. Select a service (e.g., massage)
4. `next Friday` → Select date
5. `2:00 PM` → Select time
6. `yes` → Confirm saved info
7. `yes` → Confirm booking

## 🧪 Local Testing (Without WhatsApp)

You can test the bot logic locally by creating a simple test script:

### Create `test-bot.ts`

```typescript
import { handleMessage } from './src/chat.js';

async function testBot() {
  const testPhone = "+420123456789";
  
  console.log("=== Test 1: Greeting ===");
  const greeting = await handleMessage(testPhone, "hi");
  console.log(greeting);
  console.log("\n");
  
  console.log("=== Test 2: Service Selection ===");
  const service = await handleMessage(testPhone, "haircut");
  console.log(service);
  console.log("\n");
  
  console.log("=== Test 3: Date Selection ===");
  const date = await handleMessage(testPhone, "tomorrow");
  console.log(date);
  console.log("\n");
  
  // Continue with more tests...
}

testBot().catch(console.error);
```

Run with:
```bash
tsx test-bot.ts
```

## 🔍 Debugging Tips

### Check Console Logs
The bot logs important information:
- `📧 Contact info captured` - When user provides contact info
- `💾 Stored in userState` - When user info is saved
- `🎫 Creating booking` - When booking is being created
- `✅ Booking created` - When booking succeeds

### Check Server Status
Visit `http://localhost:4000` in your browser to see:
- Server status
- Configuration check
- Webhook endpoint info

### Common Issues

**Issue:** Bot doesn't respond
- Check if server is running
- Check Twilio webhook URL is correct
- Check console for errors

**Issue:** Service not found
- Verify `BUSINESS_ID` is correct
- Check Reservio API key is valid
- Check if services exist in Reservio

**Issue:** Time slots not showing
- Check `RESOURCE_ID` is set correctly
- Verify timezone settings
- Check Reservio API response in console

**Issue:** User info not persisting
- User info is stored in memory (userState)
- Restarting server clears saved info
- This is expected behavior (in-memory storage)

## 📊 Testing Checklist

- [ ] Enhanced greeting displays correctly
- [ ] **Direct booking intent detection skips greeting (NEW)**
- [ ] **Booking intent with service goes straight to date selection (NEW)**
- [ ] **Booking intent with service + date shows slots immediately (NEW)**
- [ ] **Booking intent with service + date + time filters slots correctly (NEW)**
- [ ] **Time constraints "after X" and "before X" filter slots correctly (NEW)**
- [ ] **"After 3pm" shows only slots at or after 3:00 PM (NEW)**
- [ ] **Message explicitly mentions "after 3:00 PM" when that constraint is applied (NEW)**
- [ ] **"Before 2pm" shows only slots at or before 2:00 PM (NEW)**
- [ ] **Message explicitly mentions "before 2:00 PM" when that constraint is applied (NEW)**
- [ ] Business info request works at any point
- [ ] Service name matching handles variations
- [ ] User info is saved after first booking
- [ ] Returning users see welcome back message
- [ ] Saved info confirmation works
- [ ] Back-stepping detection works
- [ ] Time change confirmation works
- [ ] Multi-venue selection works (if configured)
- [ ] Off-track detection guides users back
- [ ] Full booking flow completes successfully
- [ ] Second booking uses saved info

## 🎯 Quick Test Commands

### Standard Flow (with greeting)
Copy-paste these into WhatsApp for quick testing:

```
hi
what are your hours?
haircut
tomorrow
10:00 AM
John Doe, john@example.com
yes
```

Then start a new conversation:
```
hi
haircut
next Friday
2:00 PM
yes
yes
```

### Direct Booking Flow (NEW - skips greeting)
Test immediate booking intent:

```
I want to book a haircut tomorrow at 10am
John Doe, john@example.com
yes
```

Or more natural variations:
```
I need a haircut
tomorrow
10:00 AM
John Doe, john@example.com
yes
```

Czech version:
```
Chci si zarezervovat střih zítra ráno
Jan Novák, jan@example.cz
ano
```

### Time Constraints (NEW - "after X" / "before X")
Test time filtering with explicit time mention:

```
I want a haircut on Friday after 3pm
[Bot shows: "For Strihani on 12 December after 3:00 PM we have slots available"]
[Only shows slots starting at 3:00 PM or later]
3:00 PM
John Doe, john@example.com
yes
```

Or:
```
I need a haircut tomorrow before 2pm
[Bot shows: "For Strihani on 11 December before 2:00 PM we have slots available"]
[Only shows slots up to 2:00 PM]
1:00 PM
John Doe, john@example.com
yes
```

### Cross-Shop Availability Checking (NEW - Option 2)
Test when default shop has no availability:

**Scenario 1: Automatic alternative suggestion**
```
I want a haircut today in the afternoon
[Bot checks Rico Studio - finds no afternoon slots]
[Bot automatically checks Holičství 21]
[Bot shows: "Rico Studio doesn't have afternoon slots available on [date]. But I found availability at:
1. **Holičství 21**
   2:00 PM, 3:30 PM, 4:00 PM (+2 more)

Reply with the number to see full availability, or say 'other times' to see different times at Rico Studio."]
```

**User selects alternative shop:**
```
1
[Bot shows all afternoon slots from Holičství 21]
2:00 PM
John Doe, john@example.com
yes
[Booking created at Holičství 21]
```

**User wants other times at original shop:**
```
other times
[Bot shows ALL available times at Rico Studio, not just afternoon]
10:00 AM
John Doe, john@example.com
yes
[Booking created at Rico Studio]
```

**Scenario 2: Works in guided flow too**
```
hi
1 (select Barbershop)
1 (select Holičství 21)
Střih
tomorrow after 6pm
[If Holičství 21 has no evening slots, bot automatically checks Rico Studio]
```

## 🧪 READ-ONLY MODE Testing Checklist

Before testing with LIVE bookings:

- [ ] Verify `READ_ONLY_MODE=true` in `.env`
- [ ] Complete at least one full booking flow for each category
- [ ] Confirm mock confirmation messages appear
- [ ] Check console logs show booking would have been created
- [ ] Test category auto-detection works
- [ ] Test service matching across businesses works
- [ ] Verify no actual bookings appear in Reservio dashboard

## 📊 Multi-Business Testing Checklist

- [ ] Category selection shows both Barbershop and Physiotherapy
- [ ] Can select category by number (1, 2)
- [ ] Can select category by name (barbershop, physiotherapy)
- [ ] Auto-detection works for "I want a haircut"
- [ ] Auto-detection works for "I need a massage"
- [ ] Barbershop selection shows both Rico Studio and Holičství 21
- [ ] Services load correctly for each barbershop
- [ ] Availability checking works for each business
- [ ] **Cross-shop checking: When one shop has no slots, bot suggests alternatives**
- [ ] **Cross-shop checking: User can select alternative shop and book there**
- [ ] **Cross-shop checking: User can request other times at original shop**
- [ ] **Cross-shop checking: Works for direct booking intents**
- [ ] **Cross-shop checking: Only checks barbershops within same category**
- [ ] Bookings track correct business context
- [ ] Console logs show which business is being used
- [ ] Console logs show cross-shop checking when triggered

## 🔧 Troubleshooting Multi-Business Issues

**Issue:** Category selection not showing
- Check if `src/businesses.ts` has multiple businesses configured
- Verify businesses have different categories

**Issue:** Services not loading after category selection
- Check console for API errors
- Verify business API tokens are valid in `src/businesses.ts`
- Confirm `setCurrentBusiness()` is being called

**Issue:** Bookings still being created in READ_ONLY mode
- Verify `.env` has `READ_ONLY_MODE=true`
- Restart the server after changing `.env`
- Check console logs for "READ-ONLY MODE" messages

**Issue:** Wrong business being used for booking
- Check `userState[from].selectedBusinessId` in console logs
- Verify `setCurrentBusiness()` is called with correct ID
- Check that business context persists throughout conversation

## 💡 Pro Tips

1. **Test with different languages**: Try Czech and English inputs
2. **Test edge cases**: Typos, partial names, ambiguous dates
3. **Test timing**: Try booking for today, tomorrow, next week
4. **Test persistence**: Complete booking, restart server, start new booking (info should be cleared)
5. **Monitor console**: Watch for errors and debug logs
6. **Test both categories**: Make sure to test both hair salon and physiotherapy flows
7. **Use READ_ONLY mode**: Always test with READ_ONLY_MODE=true first!
8. **Check business context**: Verify correct business is selected in console logs

---

Happy testing! 🚀

## 🔐 Security Note

The business API tokens in `src/businesses.ts` are for LIVE systems. In production:
- Move tokens to secure environment variables
- Use a secrets management system (AWS Secrets Manager, etc.)
- Never commit tokens to version control
- Rotate tokens regularly

