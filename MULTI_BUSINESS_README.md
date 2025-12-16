# Multi-Business AI Booking Bot

## Overview

This bot has been transformed from a single-business booking system to a **multi-business booking assistant** that manages appointments across different business categories. Users interact with "Bridget," an AI assistant that helps them choose a business category and book appointments.

## Architecture

### Business Categories

The bot supports two main categories:

1. **Hair Salon** - Barbershop services (haircuts, beard trims, styling, grooming)
2. **Physiotherapy** - Therapy and wellness services (massage, rehabilitation, therapy)

### Key Components

#### 1. **Business Configuration** (`src/businesses.ts`)

Centralized configuration for all businesses:
- Business ID, name, and category
- API endpoints and access tokens
- Live system flags for safety

```typescript
const BUSINESSES = [
  {
    id: 'd709a085-8c00-4bea-af6c-438e5741521a',
    name: 'Barbershop',
    category: 'hair_salon',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/...',
    accessToken: 'eyJ0eXAi...',
    isLive: true
  },
  // ... more businesses
];
```

#### 2. **Dynamic Business Switching** (`src/reservio.ts`)

The Reservio API layer now supports:
- Dynamic business context switching
- Business-specific API clients
- READ-ONLY mode for safe testing
- Backward compatibility with single-business mode

```typescript
setCurrentBusiness(businessId);  // Switch to specific business
getCurrentBusiness();             // Get current business context
```

#### 3. **Session State** (`src/session.ts`)

Enhanced session tracking:
- `selectedBusinessId` - Which business the user chose
- `selectedCategory` - Which category (hair_salon or physiotherapy)
- `selectedBusinessName` - Business name for display

#### 4. **Multi-Business Chat Flow** (`src/chat.ts`)

New conversation flow:
```
User: "hi"
↓
Bot: "Hi, this is Bridget..." (shows categories)
↓
User: "1" or "hair salon"
↓
Bot: Shows hair salon services
↓
User selects service, date, time
↓
Booking created for correct business
```

**Smart Auto-Detection:**
- If user says "I want a haircut" on first message
- Bot auto-detects "hair_salon" category
- Skips category selection step

#### 5. **Service Aggregation** (`src/multi-business-helpers.ts`)

Helper functions for:
- Loading services from all businesses in a category
- AI-powered service aggregation (grouping similar services)
- Cross-business availability checking

## Safety Features

### READ-ONLY Mode

**CRITICAL**: The bot connects to LIVE booking systems. To prevent accidental bookings:

**Enable in `.env`:**
```env
READ_ONLY_MODE=true
```

**What it does:**
- ✅ Shows all services and availability
- ✅ Allows full booking flow
- ✅ Logs all booking details
- ❌ **DOES NOT create actual bookings**
- 📋 Shows mock confirmation message

**Console output in READ-ONLY mode:**
```
⚠️  READ-ONLY MODE: Booking NOT created (prevented by READ_ONLY_MODE flag)
📋 Would have created booking with:
   - Business: Barbershop
   - Service ID: service_123
   - Client: John Doe (john@example.com)
   - Time: 2025-01-15T10:00:00
```

### Business Safety Flags

Each business has an `isLive: true` flag as an additional reminder that it's a real, active system.

## User Experience Flow

### 1. Initial Greeting

**User:** `hi`

**Bot Response:**
```
Hi, this is Bridget, your AI assistant. I can help you book appointments.

What type of service are you looking for?

Please select a service category:
1. Hair Salon - haircuts, styling, beard trims, grooming
2. Physiotherapy - massage, rehabilitation, therapy
```

### 2. Category Selection

**User:** `1` or `hair salon` or `I want a haircut`

**Bot Response:**
```
Great! Here are the Hair Salon services available:

• Haircut - 30 minutes
• Beard Trim - 15 minutes
• Kids Haircut - 20 minutes

To book your appointment, please reply with the exact name of the service you'd like.
```

### 3. Booking Flow

Same as before:
- User selects service
- User selects date
- User selects time
- User provides contact info
- Booking confirmed (or mock confirmation in READ-ONLY mode)

### 4. Smart Intent Detection

**User (first message):** `I need a massage tomorrow`

**Bot Response:**
- Auto-detects "physiotherapy" category
- Skips category selection
- Shows physiotherapy services or asks for date

## Testing

See [`TESTING.md`](TESTING.md) for comprehensive testing guide.

### Quick Test

1. **Enable READ-ONLY mode:**
   ```env
   READ_ONLY_MODE=true
   ```

2. **Start server:**
   ```bash
   npm run dev
   ```

3. **Test category flow:**
   - Send: `hi`
   - Bot shows categories
   - Send: `1` (hair salon)
   - Bot shows hair services

4. **Test auto-detection:**
   - Send: `hi` (new conversation)
   - Send: `I want a haircut`
   - Bot auto-selects hair salon category

5. **Complete booking flow:**
   - Select service, date, time
   - Provide contact info
   - Confirm booking
   - See mock confirmation (READ-ONLY mode)

## Configuration

### Adding a New Business

Edit `src/businesses.ts`:

```typescript
export const BUSINESSES: BusinessConfig[] = [
  // ... existing businesses
  {
    id: 'new-business-id',
    name: 'New Business Name',
    category: 'hair_salon', // or 'physiotherapy'
    apiEndpoint: 'https://api.reservio.com/v2/businesses/new-business-id',
    accessToken: 'your-access-token',
    isLive: true,
    description: 'Description of services'
  }
];
```

### Adding a New Category

1. Update type definition in `src/businesses.ts`:
   ```typescript
   category: 'hair_salon' | 'physiotherapy' | 'spa'
   ```

2. Add category names in `CATEGORY_NAMES`:
   ```typescript
   spa: {
     en: 'Spa & Wellness',
     cs: 'Lázně a wellness',
     description: 'Spa treatments, wellness, relaxation'
   }
   ```

3. Update translations in `src/translations.ts`:
   ```typescript
   categorySpa: "3. Spa & Wellness - spa treatments, relaxation"
   ```

4. Update category detection in `src/chat.ts`:
   ```typescript
   if (text.trim() === "3" || /spa|wellness|lázně/i.test(text)) {
     selectedCategory = "spa";
   }
   ```

## API Reference

### Business Management

```typescript
// Get all businesses
const businesses = getAllBusinesses();

// Get businesses by category
const hairSalons = getBusinessesByCategory('hair_salon');

// Get business by ID
const business = getBusinessById('business-id');

// Set current business for API calls
setCurrentBusiness('business-id');
```

### Multi-Business Operations

```typescript
// Get services from all businesses in category
const services = await getServicesForCategory('hair_salon');

// Aggregate similar services using AI
const aggregated = await aggregateServices(services);

// Get availability across multiple businesses
const availability = await getAvailabilityAcrossBusinesses(
  serviceId,
  businessIds,
  from,
  to
);
```

## Deployment

### Environment Variables

Required:
```env
READ_ONLY_MODE=true          # Set to false for production
OPENAI_API_KEY=sk-...        # OpenAI API key
LANGUAGE=cs                  # 'en' or 'cs'
BUSINESS_TIMEZONE=Europe/Prague
PORT=4000
```

### Production Checklist

- [ ] Set `READ_ONLY_MODE=false`
- [ ] Verify all business API tokens are valid
- [ ] Test booking flow for each category
- [ ] Monitor logs for errors
- [ ] Set up error alerts
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Set up logging aggregation

### Security Best Practices

1. **Move API tokens to secrets manager:**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

2. **Never commit tokens to version control:**
   - Add to `.gitignore`
   - Use environment variables
   - Rotate regularly

3. **Monitor API usage:**
   - Set up alerts for unusual activity
   - Track booking patterns
   - Log all API calls

4. **Implement rate limiting:**
   - Prevent abuse
   - Protect API quotas
   - Throttle requests

## Troubleshooting

### Issue: Category selection not showing

**Cause:** Only one business configured

**Solution:** Add at least 2 businesses with different categories in `src/businesses.ts`

### Issue: Services not loading after category selection

**Cause:** API error or invalid token

**Solution:**
1. Check console for error messages
2. Verify business API token in `src/businesses.ts`
3. Test API token manually with curl
4. Check Reservio API status

### Issue: Bookings still being created in READ-ONLY mode

**Cause:** Environment variable not loaded

**Solution:**
1. Verify `.env` has `READ_ONLY_MODE=true`
2. Restart server completely
3. Check console logs for "READ-ONLY MODE" messages

### Issue: Wrong business used for booking

**Cause:** Business context not set correctly

**Solution:**
1. Check console logs for `selectedBusinessId`
2. Verify `setCurrentBusiness()` is called
3. Check session state persistence

## Migration from Single-Business

If you're migrating from the old single-business setup:

1. **Keep existing `.env` for backward compatibility:**
   ```env
   BUSINESS_ID=your-old-business-id
   RESERVIO_API_KEY=your-old-api-key
   ```

2. **Add new businesses to `src/businesses.ts`**

3. **Test both modes:**
   - Single-business (legacy)
   - Multi-business (new)

4. **Gradually transition:**
   - Start with READ-ONLY mode
   - Test thoroughly
   - Switch to multi-business

## Future Enhancements

Possible improvements:

1. **Service Aggregation Across Businesses:**
   - Show "Haircut available at 3 locations"
   - Let user pick location after seeing availability

2. **Location-Based Recommendations:**
   - Ask for user's location
   - Recommend nearest business

3. **Price Comparison:**
   - Show prices for same service at different locations
   - Help users choose based on budget

4. **Availability Optimization:**
   - Show combined availability from multiple businesses
   - Suggest alternative locations if preferred is full

5. **Business-Specific Features:**
   - Custom branding per business
   - Different greeting messages
   - Category-specific prompts

6. **Analytics & Reporting:**
   - Track which businesses are most popular
   - Monitor conversion rates per category
   - Analyze booking patterns

## Support

For issues or questions:
1. Check [`TESTING.md`](TESTING.md) for testing guide
2. Review console logs for errors
3. Verify API tokens are valid
4. Test with READ-ONLY mode first

## License

(Your license here)

