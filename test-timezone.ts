import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import dotenv from "dotenv";

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.RESERVIO_TIMEZONE ||
  "Europe/Prague";

console.log("\n=== TIMEZONE TEST ===");
console.log(`BUSINESS_TIMEZONE from env:`, process.env.BUSINESS_TIMEZONE);
console.log(`BUSINESS_TZ being used:`, BUSINESS_TZ);

// Simulate a date request
const userInput = "13 October";
const parsed = dayjs.tz(
  `13 October ${dayjs().year()}`,
  "D MMMM YYYY",
  BUSINESS_TZ
);

console.log("\n=== DATE PARSING ===");
console.log(`User input: "${userInput}"`);
console.log(`Parsed:`, parsed.format());
console.log(`Start of day:`, parsed.startOf("day").format());
console.log(`End of day:`, parsed.endOf("day").format());

// Test what gets sent to API
console.log("\n=== API REQUEST ===");
const dayStart = parsed.startOf("day");
const dayEnd = parsed.endOf("day");
console.log(`Using .format():`, dayStart.format());
console.log(`Using .toISOString():`, dayStart.toISOString());

// Simulate API response
const mockSlot = {
  start: "2025-10-13T08:00:00+02:00", // Prague time (summer)
  end: "2025-10-13T08:30:00+02:00",
};

console.log("\n=== SLOT DISPLAY ===");
console.log(`API returns:`, mockSlot.start);
console.log(
  `WRONG - dayjs.tz(start, TZ):`,
  dayjs.tz(mockSlot.start, BUSINESS_TZ).format("HH:mm")
);
console.log(
  `CORRECT - dayjs(start).tz(TZ):`,
  dayjs(mockSlot.start).tz(BUSINESS_TZ).format("HH:mm")
);
console.log(
  `In Africa/Accra:`,
  dayjs(mockSlot.start).tz("Africa/Accra").format("HH:mm")
);

// Test timezone offset
console.log("\n=== TIMEZONE OFFSETS ===");
console.log(`${BUSINESS_TZ} offset:`, dayjs().tz(BUSINESS_TZ).format("Z"));
console.log(`Africa/Accra offset:`, dayjs().tz("Africa/Accra").format("Z"));
console.log(`UTC offset:`, dayjs().utc().format("Z"));
