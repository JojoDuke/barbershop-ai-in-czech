# Testing Guide for Barbershop AI Bot

This guide will help you test all the new features we've implemented.

## 🚀 Quick Start

### 1. Environment Setup

Make sure your `.env` file has all required variables:

```env
# Database (optional - not used for in-memory user persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/barbershop

# OpenAI
OPENAI_API_KEY=sk-...

# Reservio API
RESERVIO_API_KEY=your_reservio_api_key
BUSINESS_ID=your_reservio_business_id
RESOURCE_ID=your_reservio_resource_id

# For multi-venue support (optional)
# BUSINESS_IDS=business_id_1,business_id_2,business_id_3

# Timezone
BUSINESS_TIMEZONE=Europe/Prague
RESERVIO_TIMEZONE=Europe/Prague

# Server
PORT=4000
```

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

### Test Scenarios

#### ✅ Test 1: Enhanced Greeting
**Send:** `hi` or `hello`

**Expected:**
- Bot explains its capabilities
- Shows list of available services
- Message should mention: "I can help you: Check service availability, Book appointments, Get business information"

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

#### ✅ Test 9: Full Booking Flow
**Complete end-to-end test:**
1. `hi` → See greeting and services
2. `haircut` → Select service
3. `tomorrow` → Select date
4. `10:00 AM` → Select time
5. `John Doe, john@example.com` → Provide contact (first time)
6. `yes` → Confirm booking
7. **Expected:** Booking confirmation message

**Second booking (should use saved info):**
1. `hi` → See "Welcome back, John!"
2. `haircut` → Select service
3. `next Friday` → Select date
4. `2:00 PM` → Select time
5. `yes` → Confirm saved info
6. `yes` → Confirm booking

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

## 💡 Pro Tips

1. **Test with different languages**: Try Czech and English inputs
2. **Test edge cases**: Typos, partial names, ambiguous dates
3. **Test timing**: Try booking for today, tomorrow, next week
4. **Test persistence**: Complete booking, restart server, start new booking (info should be cleared)
5. **Monitor console**: Watch for errors and debug logs

---

Happy testing! 🚀

