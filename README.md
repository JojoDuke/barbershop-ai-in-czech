# Barbershop AI - WhatsApp Booking Bot 💈🤖

An intelligent WhatsApp chatbot that automates barbershop appointment bookings using conversational AI. Built with Node.js, TypeScript, OpenAI, and integrated with Reservio for seamless booking management.

## 🌟 Features

- **WhatsApp Integration**: Natural conversation interface via Twilio
- **Intelligent Booking Flow**: Guides customers through service selection, date/time picking, and confirmation
- **Multiple Date Formats**: Understands various date inputs (e.g., "7th October", "tomorrow", "Monday", "2025-10-07")
- **Timezone-Aware**: Properly handles business timezone for accurate scheduling
- **Real-time Availability**: Fetches and displays available time slots from Reservio API
- **Customer Database**: Stores customer information and booking history in PostgreSQL
- **Duplicate Prevention**: Filters out duplicate and past time slots
- **AI-Powered Responses**: Uses OpenAI GPT-4.1 for friendly, contextual responses
- **Confirmation System**: Validates customer details before finalizing bookings

## 🏗️ Architecture

```
┌─────────────┐
│  WhatsApp   │
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐       ┌──────────────┐
│   Twilio    │◄─────►│  Express.js  │
│  Webhook    │       │    Server    │
└─────────────┘       └──────┬───────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
              ┌─────────┐ ┌──────┐ ┌────────┐
              │ OpenAI  │ │Prisma│ │Reservio│
              │   API   │ │  DB  │ │  API   │
              └─────────┘ └──────┘ └────────┘
```

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI**: OpenAI GPT-4.1
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: Twilio WhatsApp API
- **Booking System**: Reservio API
- **Date/Time**: Day.js with timezone support

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Twilio account with WhatsApp Business API access
- Reservio account with API access
- OpenAI API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/barbershop-ai.git
cd barbershop-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/barbershop

# OpenAI
OPENAI_API_KEY=sk-...

# Reservio API
RESERVIO_API_KEY=your_reservio_api_key
BUSINESS_ID=your_reservio_business_id
RESOURCE_ID=your_reservio_resource_id

# Timezone (IANA timezone format)
BUSINESS_TIMEZONE=Europe/Prague
RESERVIO_TIMEZONE=Europe/Prague

# Server
PORT=4000
```

### 4. Database Setup

Run Prisma migrations to set up your database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:4000` (or your configured PORT).

## 📱 WhatsApp Setup

### Configure Twilio Webhook

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Navigate to: Messaging > Try it out > Send a WhatsApp message
3. Configure your Sandbox or WhatsApp Business Number
4. Set the webhook URL to: `https://yourdomain.com/whatsapp`
5. Set HTTP method to `POST`

### Testing Locally with ngrok

```bash
ngrok http 4000
```

Use the ngrok URL as your Twilio webhook: `https://abc123.ngrok.io/whatsapp`

## 💬 Conversation Flow

1. **Greeting**: User sends initial message (e.g., "hi", "hello")
2. **Service Selection**: Bot displays available services with durations
3. **Date Selection**: User provides preferred date
4. **Time Slot Selection**: Bot shows available time slots
5. **Contact Details**: User provides name and email
6. **Confirmation**: User confirms booking details
7. **Booking Complete**: Bot confirms and saves to database + Reservio

### Example Conversation

```
User: Hi
Bot: Welcome to [Business Name]!

Please select a service from our menu:

• Haircut - 30 minutes
• Beard Trim - 15 minutes
• Haircut + Beard - 45 minutes

To book your appointment, please reply with the exact name of the service you'd like.

User: Haircut
Bot: What date would you like to book your appointment? (e.g. 7th October)

User: tomorrow
Bot: For Haircut on 27 October we have slots available for:
• 09:00 - 09:30
• 10:00 - 10:30
• 11:00 - 11:30
...

User: 10:00 - 10:30
Bot: You picked: Monday, 27th October, 10:00 for Haircut. 
Please reply with your full name and email address to confirm the booking. 
(e.g. John Doe, john@example.com)

User: John Smith, john@example.com
Bot: Thank you, John Smith! Please confirm you want to book this slot for 
john@example.com by replying 'yes'.

User: yes
Bot: Great news! Your booking is confirmed for Monday at 10:00. 
We look forward to seeing you!

Best regards,
[Business Name] Team
```

## 📂 Project Structure

```
barbershop-ai/
├── src/
│   ├── index.ts         # Express server & webhook endpoint
│   ├── chat.ts          # Main conversation logic & booking flow
│   ├── ai.ts            # OpenAI integration
│   ├── reservio.ts      # Reservio API client
│   ├── db.ts            # Database operations (Prisma)
│   ├── session.ts       # Session management interface
│   └── stripe.ts        # Payment integration (placeholder)
├── prisma/
│   └── schema.prisma    # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### User Table
- `id`: UUID primary key
- `phone`: Unique phone number (WhatsApp)
- `name`: Customer name
- `email`: Customer email
- `createdAt`: Account creation timestamp

### Booking Table
- `id`: UUID primary key
- `userId`: Foreign key to User
- `serviceId`: Reservio service ID
- `slotStart`: Appointment start time
- `slotEnd`: Appointment end time
- `status`: Booking status (pending/confirmed)
- `createdAt`: Booking creation timestamp

## 🎯 Key Features Explained

### Timezone Handling

The bot properly handles timezones to ensure accurate booking times:
- Converts all dates/times to business timezone
- Displays times in business timezone to customers
- Prevents timezone-related booking conflicts

### Date Parsing

Supports multiple natural language date formats:
- ISO format: `2025-10-07`
- Slash format: `07/10/2025`
- Natural language: `7th October`, `October 7`, `7 October 2025`
- Relative dates: `today`, `tomorrow`
- Weekday names: `Monday`, `Tuesday`, etc.

### Slot Management

- Fetches real-time availability from Reservio
- Filters out past time slots
- Removes duplicates
- Paginated display (10 slots per page)
- Allows users to request more slots or different dates

### State Management

Maintains conversation state per user including:
- Current step in booking flow
- Selected service
- Available slots
- Chosen time slot
- Customer details
- Pagination state

## 🔧 API Integration

### Reservio API

The bot integrates with Reservio's REST API to:
- Fetch business information
- Retrieve available services
- Get real-time booking slots
- Create confirmed bookings
- Manage customer records

### OpenAI API

Uses GPT-4.1 for:
- Friendly confirmation messages
- Error handling responses
- Natural language understanding (fallback cases)

## 🚨 Error Handling

- Validates service selection against available services
- Checks date parsing before querying slots
- Confirms time slot availability before booking
- Validates email format in contact details
- Provides helpful error messages for user guidance

## 🔐 Security Considerations

- Environment variables for sensitive credentials
- Input validation on all user inputs
- Phone number sanitization (removes "whatsapp:" prefix)
- Email format validation
- PostgreSQL parameterized queries via Prisma

## 📈 Future Enhancements

- [ ] Payment integration via Stripe (stripe.ts placeholder exists)
- [ ] Booking cancellation/rescheduling
- [ ] Reminder notifications
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Customer feedback collection
- [ ] Loyalty program integration
- [ ] Staff selection for bookings
- [ ] Waiting list management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👤 Author

Your Name

## 🙏 Acknowledgments

- [Twilio](https://www.twilio.com/) for WhatsApp Business API
- [Reservio](https://www.reservio.com/) for booking management system
- [OpenAI](https://openai.com/) for GPT-4.1 API
- [Prisma](https://www.prisma.io/) for database ORM

## 📞 Support

For issues or questions, please open an issue on GitHub or contact [your-email@example.com]

---

Built with ❤️ for barbershops and salons worldwide

