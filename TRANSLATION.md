# Translation System

This project supports multiple languages through a centralized translation system.

## How It Works

All user-facing text is stored in `src/translations.ts` and can be easily switched between languages.

## Supported Languages

- **English** (`en`)
- **Czech** (`cs`) ✓ Default

## Configuration

Set the language in your `.env` file:

```env
# Language setting
LANGUAGE=cs     # For Czech (default)
# LANGUAGE=en   # For English
```

## Features

### Automatic Date/Time Localization
- Date formats automatically adapt to the selected language
- Czech: "pondělí, 7. října"
- English: "Monday, 7th October"

### Keyword Detection
The bot recognizes keywords in both languages:

**Greetings (to restart conversation):**
- English: `hi`, `hello`, `hey`, `start`, `restart`, `menu`
- Czech: `ahoj`, `nazdar`, `dobrý den`, `začít`, `znovu`

**More slots:**
- English: `more`, `other`, `additional`, `another`
- Czech: `více`, `další`, `jiné`

**Confirmation:**
- English: `yes`
- Czech: `ano`

### AM/PM Time Format
Times are displayed in 12-hour format with AM/PM indicators:
- `9:00 AM - 9:30 AM`
- `1:00 PM - 1:30 PM`

Users can reply with either format:
- `1:00 PM - 1:30 PM` (12-hour)
- `13:00 - 13:30` (24-hour)

## Adding a New Language

1. Open `src/translations.ts`
2. Add your language code to the `Language` type:
```typescript
export type Language = 'en' | 'cs' | 'sk'; // Added Slovak
```

3. Add translations in the `translations` object:
```typescript
sk: {
  welcome: (businessName: string) => `Vitajte v ${businessName}!`,
  selectService: "Prosím vyberte službu z nášho menu:",
  // ... add all other translations
}
```

4. Import the locale in `chat.ts`:
```typescript
import "dayjs/locale/sk"; // Slovak locale
```

5. Update `.env`:
```env
LANGUAGE=sk
```

## Translation Files

- **`src/translations.ts`** - All translations and language logic
- **`src/chat.ts`** - Uses translations via `import { t } from "./translations.js"`
- **`.env`** - Language configuration

## Example Usage

```typescript
import { t } from "./translations.js";

// Simple translation
return t.whatDate;

// Translation with parameters
return t.welcome(businessName);

// Translation function
return t.noSlotsAvailable(date);
```

## Current Status

✅ All chatbot messages translated to Czech  
✅ Czech date/time formatting  
✅ Czech keyword recognition  
✅ System prompts for AI in Czech  
✅ Easy language switching via environment variable  

## Switching Back to English

To switch back to English, simply change your `.env` file:

```env
LANGUAGE=en
```

Then restart your server.

