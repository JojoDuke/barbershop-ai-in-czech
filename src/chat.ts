import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import OpenAI from "openai";
import {
  createBooking,
  getAvailableSlots,
  getBusiness,
  getServices,
} from "./reservio.js";
import { upsertUser, createBookingRecord } from "./db.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.RESERVIO_TIMEZONE ||
  "Europe/Prague";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple memory for conversation state
const userState: Record<string, any> = {};

// Helpers
function ordinalSuffix(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatSlotFriendly(isoOrDay: string | dayjs.Dayjs) {
  // ensure we interpret and display in the business timezone
  const dt =
    typeof isoOrDay === "string"
      ? dayjs.tz(isoOrDay, BUSINESS_TZ)
      : dayjs.tz(isoOrDay.toISOString(), BUSINESS_TZ);

  const weekday = dt.format("dddd");
  const dayNum = dt.date();
  const padded = String(dayNum).padStart(2, "0");
  const ord = ordinalSuffix(dayNum);
  const month = dt.format("MMMM");
  const time = dt.format("h:mm A");
  return `${weekday}, ${padded}${ord} ${month}, ${time}`;
}

function tzOffsetLabel() {
  return dayjs.tz(dayjs(), BUSINESS_TZ).format("Z");
}

// Duration conversion stuff
function formatDuration(seconds: number | undefined) {
  if (!seconds || typeof seconds !== "number") return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} minutes`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs}h ${rem}m`;
}


// Getting services
function buildServiceMenu(businessName: string, services: any[]) {
  const serviceList = services
    .map(
      (s: any) =>
        `• ${s.attributes.name} - ${formatDuration(s.attributes.duration)}`
    )
    .join("\n");

  return `Welcome to ${businessName}!\n\nPlease select a service from our menu:\n\n${serviceList}\n\nTo book your appointment, please reply with the exact name of the service you'd like.`;
}


// Date conversion stuff
function parseRequestedDate(text: string): dayjs.Dayjs | null {
  // ISO format
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return dayjs.tz(iso[1], BUSINESS_TZ);

  // Slash or dash format
  const slash = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (slash) return dayjs(slash[1], ["DD/MM/YYYY", "D/M/YYYY", "MM/DD/YYYY"]);

  // Ordinal or month name format (e.g. '8th October', '7 October', 'October 8', '8 October 2025')
  const ordinal = text.match(
    /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i
  );
  if (ordinal) {
    const day = ordinal[1];
    const month = ordinal[2];
    const year = ordinal[3] || String(dayjs().year());
    const dateStr = `${day} ${month} ${year}`;
    return dayjs.tz(dateStr, "D MMMM YYYY", BUSINESS_TZ);
  }
  const monthFirst = text.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i
  );
  if (monthFirst) {
    const month = monthFirst[1];
    const day = monthFirst[2];
    const year = monthFirst[3] || String(dayjs().year());
    const dateStr = `${day} ${month} ${year}`;
    return dayjs.tz(dateStr, "D MMMM YYYY", BUSINESS_TZ);
  }

  // Relative days
  if (/\btomorrow\b/i.test(text))
    return dayjs
      .tz(dayjs().add(1, "day").toISOString(), BUSINESS_TZ)
      .startOf("day");
  if (/\btoday\b/i.test(text))
    return dayjs.tz(dayjs().toISOString(), BUSINESS_TZ).startOf("day");

  // Weekday name
  const weekdayMatch = text.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
  );
  if (weekdayMatch) {
    const mapping: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const dayName = weekdayMatch[1].toLowerCase();
    const targetWeekday = mapping[dayName];
    let t = dayjs.tz(dayjs().toISOString(), BUSINESS_TZ);
    for (let i = 0; i < 7; i++) {
      if (t.day() === targetWeekday) return t.startOf("day");
      t = t.add(1, "day");
    }
  }

  return null;
}


// Generate Response from Open AI
async function friendlyReply(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return completion.choices[0].message?.content || userPrompt;
}


// Bot Logic
export async function handleMessage(
  from: string,
  body: string
): Promise<string> {
  const text = body.trim();

  // If user explicitly says a greeting or restart, clear their session so we always
  // show the fresh deterministic menu. This helps testing when userState is still in memory.
  if (/^(hi|hello|hey|start|restart|menu)$/i.test(text)) {
    delete userState[from];
  }


  // Bot introduction after user texts the fist message
  if (!userState[from]) {
    const business = await getBusiness();
    const services = await getServices();
    const businessName = business?.data?.attributes?.name || "our shop";

    userState[from] = {
      step: "choose_service",
      services: services.data,
    };

    // deterministic menu message
    return buildServiceMenu(businessName, services.data);
  }

  const state = userState[from];

  // Step 1 → List Services + Duration
  if (state.step === "ask_service") {
    const services = await getServices();
    const serviceList = services.data
      .map(
        (s: any) =>
          `• ${s.attributes.name} - ${formatDuration(s.attributes.duration)}`
      )
      .join("\n");

    userState[from].step = "choose_service";
    userState[from].services = services.data;

    // deterministic message
    return `Here are the available services:\n${serviceList}\n\nPlease reply with the exact name of the service you'd like to book.`;
  }

  // Step 2 → choose service
  if (state.step === "choose_service") {
    // Match by name (case-insensitive)
    const searchName = text.trim().toLowerCase();
    const chosen = state.services.find(
      (s: any) => s.attributes.name.toLowerCase() === searchName
    );

    if (!chosen) {
      const serviceList = state.services
        .map(
          (s: any) =>
            `• ${s.attributes.name} - ${formatDuration(s.attributes.duration)}`
        )
        .join("\n");

      // deterministic error message
      return `I couldn't find that service. Please select from our list:\n\n${serviceList}\n\nTo book your appointment, please reply with the exact name of the service you'd like.`;
    }

    userState[from].chosenService = chosen;
    userState[from].serviceId = chosen.id;
    userState[from].step = "choose_date";
    return `What date would you like to book your appointment? (e.g. 7th October)`;
  }

  // Step 2b → choose date
  if (state.step === "choose_date") {
    // Try to parse the date
    const requested = parseRequestedDate(text);
    if (!requested) {
      return `Sorry, I couldn't understand the date. Please reply with a date like "7th October" or "2025-10-07".`;
    } else {
      const dayStart = requested!.startOf("day");
      const dayEnd = requested!.endOf("day");
      const slotsData = await getAvailableSlots(
        state.serviceId,
        dayStart.format(),
        dayEnd.format()
      );
      let daySlots = slotsData?.data || [];

      // Filter out past slots (double-check in case time has passed)
      const now = dayjs();
      daySlots = daySlots.filter((slot: any) =>
        dayjs(slot.attributes.start).isAfter(now)
      );

      // Remove duplicate slots based on start and end times
      const uniqueSlots = daySlots.filter(
        (slot: any, index: number, self: any[]) => {
          return (
            index ===
            self.findIndex(
              (s: any) =>
                s.attributes.start === slot.attributes.start &&
                s.attributes.end === slot.attributes.end
            )
          );
        }
      );
      daySlots = uniqueSlots;

      if (daySlots.length === 0) {
        return `Sorry — there are no available slots for ${requested!.format(
          "dddd, DD MMMM YYYY"
        )}.`;
      }
      // Format: For [Service] on [date] we have slots available for:
      const serviceName =
        state.chosenService?.attributes?.name || "the selected service";
      const dateLabel = requested!.format("D MMMM");

      // Get timezone info dynamically
      const tzName = BUSINESS_TZ;
      const tzOffset = dayjs().tz(BUSINESS_TZ).format("Z");

      // Show first 10 slots in chronological order
      const initialSlots = daySlots.slice(0, 10);
      const slotList = initialSlots
        .map((s: any) => {
          // Parse the ISO string first, then convert to business timezone
          const startTime = dayjs(s.attributes.start).tz(BUSINESS_TZ);
          const endTime = dayjs(s.attributes.end).tz(BUSINESS_TZ);
          return `• ${startTime.format("h:mm A")} - ${endTime.format("h:mm A")}`;
        })
        .join("\n");
      userState[from].slots = daySlots; // store all slots for later
      userState[from].step = "choose_slot";
      userState[from].slotPage = 1;
      return `For ${serviceName} on ${dateLabel} we have slots available for (times shown in ${tzName}, UTC${tzOffset}):\n${slotList}\n\nReply with the time range you want, or type 'more' to show more available slots.`;
    }
  }

  // Step 3 → choose slot
  if (state.step === "choose_slot") {
    // detect "more" for additional slots for current date
    if (/\b(more|other|additional|another)\b/i.test(text)) {
      // Show next 10 slots (up to 20)
      let slots = state.slots || [];

      // Filter out past slots (in case time has passed since initial query)
      const now = dayjs();
      slots = slots.filter((slot: any) =>
        dayjs(slot.attributes.start).isAfter(now)
      );

      // Remove duplicate slots based on start and end times
      const uniqueSlots = slots.filter(
        (slot: any, index: number, self: any[]) => {
          return (
            index ===
            self.findIndex(
              (s: any) =>
                s.attributes.start === slot.attributes.start &&
                s.attributes.end === slot.attributes.end
            )
          );
        }
      );
      slots = uniqueSlots;

      const page = state.slotPage || 1;
      const nextSlots = slots.slice(page * 10, (page + 1) * 10);
      if (nextSlots.length === 0) {
        return `No more available slots for this date.`;
      }
      const slotList = nextSlots
        .map((s: any) => {
          const startTime = dayjs(s.attributes.start).tz(BUSINESS_TZ);
          const endTime = dayjs(s.attributes.end).tz(BUSINESS_TZ);
          return `• ${startTime.format("h:mm A")} - ${endTime.format("h:mm A")}`;
        })
        .join("\n");
      userState[from].slotPage = page + 1;
      userState[from].slots = slots; // Update with filtered slots
      return `More available slots for this date:\n${slotList}\n\nReply with the time you want, or type 'more' to show more available slots.`;
    }

    // detect "slots for <date>"
    const requested = parseRequestedDate(text);
    if (requested) {
      const dayStart = requested.startOf("day");
      const dayEnd = requested.endOf("day");
      const slotsData = await getAvailableSlots(
        state.serviceId,
        dayStart.format(),
        dayEnd.format()
      );
      let daySlots = slotsData?.data || [];

      // Filter out past slots (double-check in case time has passed)
      const now = dayjs();
      daySlots = daySlots.filter((slot: any) =>
        dayjs(slot.attributes.start).isAfter(now)
      );

      // Remove duplicate slots based on start and end times
      const uniqueSlots = daySlots.filter(
        (slot: any, index: number, self: any[]) => {
          return (
            index ===
            self.findIndex(
              (s: any) =>
                s.attributes.start === slot.attributes.start &&
                s.attributes.end === slot.attributes.end
            )
          );
        }
      );
      daySlots = uniqueSlots;

      if (daySlots.length === 0) {
        return `Sorry — there are no available slots for ${requested.format(
          "dddd, DD MMMM YYYY"
        )}.`;
      }
      // Show first 10 slots in chronological order for new date
      const initialSlots = daySlots.slice(0, 10);
      const slotList = initialSlots
        .map((s: any) => {
          const startTime = dayjs(s.attributes.start).tz(BUSINESS_TZ);
          const endTime = dayjs(s.attributes.end).tz(BUSINESS_TZ);
          return `• ${startTime.format("h:mm A")} - ${endTime.format("h:mm A")}`;
        })
        .join("\n");
      userState[from].slots = daySlots;
      userState[from].slotPage = 1;
      return `Available slots for ${requested.format(
        "dddd, DD MMMM YYYY"
      )} (times shown in ${BUSINESS_TZ} ${tzOffsetLabel()}):\n${slotList}\n\nReply with the time you want, or type 'more' to show more available slots.`;
    }

    // handle general availability questions
    if (/\b(what|which|show|list|see|available|slots?)\b/i.test(text)) {
      let slots = state.slots || [];

      // Filter out past slots (in case time has passed)
      const now = dayjs();
      slots = slots.filter((slot: any) =>
        dayjs(slot.attributes.start).isAfter(now)
      );

      // Remove duplicate slots based on start and end times
      const uniqueSlots = slots.filter(
        (slot: any, index: number, self: any[]) => {
          return (
            index ===
            self.findIndex(
              (s: any) =>
                s.attributes.start === slot.attributes.start &&
                s.attributes.end === slot.attributes.end
            )
          );
        }
      );
      slots = uniqueSlots;

      if (slots.length === 0) {
        return `Sorry — there are no more available slots for this date.`;
      }

      const PAGE = 5;
      const slotList = slots
        .slice(0, PAGE)
        .map(
          (s: any, i: number) =>
            `${i + 1}. ${formatSlotFriendly(s.attributes.start)}`
        )
        .join("\n");

      userState[from].slots = slots; // Update with filtered slots

      return await friendlyReply(
        "You are a friendly assistant.",
        `Here are the available time slots (times shown in ${BUSINESS_TZ} ${tzOffsetLabel()}):\n${slotList}\n\nReply with the time you want, or type 'more' to show more available slots.`
      );
    }

    // try selection by time range (e.g. "1:00 PM - 1:30 PM" or "13:00 - 13:30")
    const rangeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (rangeMatch) {
      const startStr = rangeMatch[1].trim();
      const endStr = rangeMatch[2].trim();
      const slots = state.slots || [];
      const chosenSlot = slots.find((s: any) => {
        const slotStart = dayjs(s.attributes.start).tz(BUSINESS_TZ);
        const slotEnd = dayjs(s.attributes.end).tz(BUSINESS_TZ);
        
        // Check both 12-hour and 24-hour formats
        const slot12Start = slotStart.format("h:mm A");
        const slot12End = slotEnd.format("h:mm A");
        const slot24Start = slotStart.format("HH:mm");
        const slot24End = slotEnd.format("HH:mm");
        
        return (
          (slot12Start === startStr && slot12End === endStr) ||
          (slot24Start === startStr && slot24End === endStr) ||
          (slot12Start.toLowerCase() === startStr.toLowerCase() && slot12End.toLowerCase() === endStr.toLowerCase())
        );
      });
      if (!chosenSlot) {
        return `I don't see that time range available. Please pick a time range from the list above, or type 'more' to show more slots.`;
      }
      userState[from].chosenSlot = chosenSlot;
      userState[from].step = "ask_contact";
      return `You picked: ${formatSlotFriendly(
        chosenSlot.attributes.start
      )} for ${
        state.chosenService.attributes.name
      }. Please reply with your full name and email address to confirm the booking. (e.g. John Doe, john@example.com)`;
    }

    // try selection by time (legacy, e.g. "1:00 PM" or "13:00")
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (timeMatch) {
      const timeStr = timeMatch[1].trim();
      const slots = state.slots || [];
      const chosenSlot = slots.find((s: any) => {
        const slotStart = dayjs(s.attributes.start).tz(BUSINESS_TZ);
        
        // Check both 12-hour and 24-hour formats
        const slot12Start = slotStart.format("h:mm A");
        const slot24Start = slotStart.format("HH:mm");
        
        return (
          slot12Start === timeStr ||
          slot24Start === timeStr ||
          slot12Start.toLowerCase() === timeStr.toLowerCase()
        );
      });
      if (!chosenSlot) {
        return `I don't see that time available. Please pick a time range from the list above, or type 'more' to show more slots.`;
      }
      userState[from].chosenSlot = chosenSlot;
      userState[from].step = "ask_contact";
      return `You picked: ${formatSlotFriendly(
        chosenSlot.attributes.start
      )} for ${
        state.chosenService.attributes.name
      }. Please reply with your full name and email address to confirm the booking. (e.g. John Doe, john@example.com)`;
    }

    // try selection by number (legacy)
    const index = parseInt(text) - 1;
    const slots = state.slots || [];
    const chosenSlot = slots[index];
    if (!chosenSlot) {
      return `I don't see that slot number. Please pick a time from the list above, or type 'more' to show more slots.`;
    }

    userState[from].chosenSlot = chosenSlot;
    userState[from].step = "ask_contact";
    return `You picked: ${formatSlotFriendly(
      chosenSlot.attributes.start
    )} for ${
      state.chosenService.attributes.name
    }. Please reply with your full name and email address to confirm the booking. (e.g. John Doe, john@example.com)`;
  }

  // Step 4a → ask for contact details
  if (state.step === "ask_contact") {
    // Expecting: "Full Name, email@example.com"
    const contactMatch = body
      .trim()
      .match(/^([^,]+),\s*([\w.-]+@[\w.-]+\.[A-Za-z]{2,})$/);
    if (!contactMatch) {
      return `Please reply with your full name and email address, separated by a comma. (e.g. John Doe, john@example.com)`;
    }
    const customerName = contactMatch[1].trim();
    const customerEmail = contactMatch[2].trim();
    userState[from].customerName = customerName;
    userState[from].customerEmail = customerEmail;
    userState[from].step = "confirm_booking";
    return `Thank you, ${customerName}! Please confirm you want to book this slot for ${customerEmail} by replying 'yes'.`;
  }

  // Step 4b → confirm booking
  if (state.step === "confirm_booking") {
    if (!/^yes$/i.test(body.trim())) {
      return `Please reply 'yes' to confirm your booking, or 'no' to cancel.`;
    }

    const customerName = state.customerName;
    const customerEmail = state.customerEmail;
    // Strip "whatsapp:" prefix from phone number if present
    const customerPhone = from.replace(/^whatsapp:/i, "");

    try {
      // Save user to database (upsert - create or update)
      const user = await upsertUser(customerPhone, customerName, customerEmail);

      // Create booking in Reservio
      const booking = await createBooking(
        state.chosenService.id,
        {
          start: state.chosenSlot.attributes.start,
          end: state.chosenSlot.attributes.end,
        },
        customerName,
        customerEmail,
        customerPhone
      );

      // Save booking to our database
      await createBookingRecord(
        user.id,
        state.chosenService.id,
        state.chosenSlot.attributes.start,
        state.chosenSlot.attributes.end
      );

      userState[from] = { step: "done" };

      // Get business name for confirmation message
      const business = await getBusiness();
      const businessName = business?.data?.attributes?.name || "our shop";

      return await friendlyReply(
        "You are a friendly barbershop assistant.",
        `Confirm to the user that their booking is successful.\nService: ${
          state.chosenService.attributes.name
        }\nTime: ${dayjs(state.chosenSlot.attributes.start).tz(BUSINESS_TZ).format(
          "dddd, h:mm A"
        )}\nName: ${customerName}\nEmail: ${customerEmail}\nMake it sound warm and welcoming. Sign off with "Best regards, ${businessName} Team"`
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      return `Sorry, there was an error creating your booking. Please try again or contact us directly.`;
    }
  }

  // fallback
  return await friendlyReply(
    "You are an assistant.",
    "Tell the user you didn’t understand and that they can type 'hi' to start again."
  );
}
