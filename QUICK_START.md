# Quick Start Guide - Multi-Business AI Bot

## 🚀 Get Started in 5 Minutes

### Step 1: Configure Environment

Create a `.env` file:

```bash
# Copy this content to your .env file
READ_ONLY_MODE=true
OPENAI_API_KEY=your-openai-api-key
LANGUAGE=cs
BUSINESS_TIMEZONE=Europe/Prague
PORT=4000
```

**⚠️ IMPORTANT:** Start with `READ_ONLY_MODE=true` to prevent creating real bookings!

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Server

```bash
npm run dev
```

### Step 4: Test with WhatsApp

1. **Expose your server:**
   ```bash
   ngrok http 4000
   ```

2. **Configure Twilio webhook:**
   - Go to Twilio Console
   - Set webhook URL: `https://your-ngrok-url.ngrok.io/whatsapp`

3. **Send test messages:**

   **Test 1: Category Selection**
   ```
   You: hi
   Bot: Hi, this is Bridget... [shows categories]
   You: 1
   Bot: [shows hair salon services]
   ```

   **Test 2: Auto-Detection**
   ```
   You: I want a haircut
   Bot: [auto-selects hair salon, shows services]
   ```

   **Test 3: Complete Booking**
   ```
   You: I want a haircut tomorrow at 10am
   Bot: [processes booking, asks for contact]
   You: John Doe, john@example.com
   You: yes
   Bot: ⚠️ TEST MODE: Booking would have been created... [READ_ONLY mode]
   ```

## 📋 What You Should See

### In WhatsApp
- Bridget introduces herself
- Shows 2 categories (Hair Salon, Physiotherapy)
- You can select by number (1, 2) or text ("hair salon")
- Smart detection: "I want a haircut" → auto-selects category
- Full booking flow works
- Mock confirmation in READ_ONLY mode

### In Console
```
🏢 Current business set to: Barbershop (hair_salon)
🎯 Auto-detected category: hair_salon
📋 Would have created booking with:
   - Business: Barbershop
   - Service ID: service_123
   - Client: John Doe (john@example.com)
⚠️  READ-ONLY MODE: Booking NOT created
```

## ✅ Verification Checklist

Test these scenarios:

- [ ] Send "hi" → See Bridget greeting with categories
- [ ] Select category "1" → See hair salon services
- [ ] Select category "2" → See physiotherapy services
- [ ] Send "I want a haircut" → Auto-detects hair salon
- [ ] Send "I need a massage" → Auto-detects physiotherapy
- [ ] Complete full booking → See mock confirmation
- [ ] Check console → See "READ-ONLY MODE" messages
- [ ] Verify NO bookings in Reservio dashboard

## 🔧 Troubleshooting

### Bot doesn't respond
- ✅ Check server is running (`npm run dev`)
- ✅ Check ngrok is running
- ✅ Verify Twilio webhook URL
- ✅ Check console for errors

### Categories not showing
- ✅ Verify `src/businesses.ts` has 2+ businesses
- ✅ Check businesses have different categories
- ✅ Restart server

### Still creating real bookings
- ✅ Verify `.env` has `READ_ONLY_MODE=true`
- ✅ Restart server completely
- ✅ Check console for "READ-ONLY MODE" messages

## 🎯 Next Steps

### Ready for Production?

1. **Test thoroughly with READ_ONLY mode:**
   ```bash
   # Complete at least 5 bookings in READ_ONLY mode
   # Test both categories
   # Test in English and Czech
   ```

2. **Disable READ_ONLY mode:**
   ```bash
   # In .env file
   READ_ONLY_MODE=false
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Test with ONE real booking:**
   - Complete a booking
   - Check Reservio dashboard
   - Verify booking appears correctly

5. **Monitor:**
   - Watch console logs
   - Check for errors
   - Monitor API usage

## 📚 Full Documentation

- **[MULTI_BUSINESS_README.md](MULTI_BUSINESS_README.md)** - Complete documentation
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was implemented

## 🆘 Need Help?

1. Check console logs for errors
2. Review [TESTING.md](TESTING.md) troubleshooting section
3. Verify API tokens in `src/businesses.ts`
4. Test with READ_ONLY mode first

## 🎉 Success!

You should now have:
- ✅ Multi-business bot running
- ✅ Category selection working
- ✅ Auto-detection working
- ✅ Safe testing with READ_ONLY mode
- ✅ No linter errors

**Happy booking! 🚀**

