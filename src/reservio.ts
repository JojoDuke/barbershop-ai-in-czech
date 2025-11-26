import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const API = "https://api.reservio.com/v2";

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.RESERVIO_TIMEZONE ||
  "Europe/Prague";

const reservio = axios.create({
  baseURL: API,
  headers: {
    Authorization: `Bearer ${
      process.env.RESERVIO_API_KEY || process.env.RESERVIO_API_KEY
    }`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Get business info (name, address, etc.)
export async function getBusiness() {
  try {
    const businessId =
      process.env.BUSINESS_ID ||
      process.env.RESERVIO_BUSINESS_ID ||
      process.env.RESERVIO_BUSINESS_ID?.toString();
    if (!businessId)
      throw new Error(
        "Missing BUSINESS_ID / RESERVIO_BUSINESS_ID environment variable"
      );

    const { data } = await reservio.get(`/businesses/${businessId}`);
    return data;
  } catch (err: any) {
    console.error(
      "Error fetching business:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Get detailed business information formatted for display
export async function getBusinessInfo() {
  try {
    const business = await getBusiness();
    const attrs = business?.data?.attributes;
    
    if (!attrs) return null;
    
    return {
      name: attrs.name || "Business",
      address: formatAddress(attrs),
      phone: attrs.phone || null,
      website: attrs.website || null,
      email: attrs.email || null,
      hours: formatBusinessHours(attrs.openingHours),
      description: attrs.description || null,
    };
  } catch (err: any) {
    console.error(
      "Error fetching business info:",
      err.response?.data || err.message
    );
    return null;
  }
}

// Format business address
function formatAddress(attrs: any): string {
  const parts = [];
  if (attrs.street) parts.push(attrs.street);
  if (attrs.city) parts.push(attrs.city);
  if (attrs.zip) parts.push(attrs.zip);
  if (attrs.country) parts.push(attrs.country);
  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

// Format business hours for display
function formatBusinessHours(openingHours: any): string {
  if (!openingHours || typeof openingHours !== "object") {
    return "Hours not available";
  }
  
  const daysMap: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  
  const lines: string[] = [];
  
  for (const [day, hours] of Object.entries(openingHours)) {
    const dayName = daysMap[day.toLowerCase()] || day;
    
    if (Array.isArray(hours) && hours.length > 0) {
      const timeRanges = hours.map((h: any) => {
        const from = h.from || h.start || "?";
        const to = h.to || h.end || "?";
        return `${from} - ${to}`;
      }).join(", ");
      lines.push(`${dayName}: ${timeRanges}`);
    } else if (hours === false || hours === null) {
      lines.push(`${dayName}: Closed`);
    }
  }
  
  return lines.length > 0 ? lines.join("\n") : "Hours not available";
}

// Get multiple venues (if BUSINESS_IDS is configured with comma-separated IDs)
export async function getMultipleVenues() {
  try {
    // Check if multiple business IDs are configured
    const businessIdsStr = process.env.BUSINESS_IDS || process.env.BUSINESS_ID;
    if (!businessIdsStr) return null;
    
    const businessIds = businessIdsStr.includes(',') 
      ? businessIdsStr.split(',').map(id => id.trim())
      : [businessIdsStr];
    
    // If only one business, return null (single venue mode)
    if (businessIds.length === 1) return null;
    
    // Fetch all venues
    const venues = await Promise.all(
      businessIds.map(async (id) => {
        try {
          const { data } = await reservio.get(`/businesses/${id}`);
          return {
            id,
            name: data?.data?.attributes?.name || "Unknown",
            address: formatAddress(data?.data?.attributes),
            city: data?.data?.attributes?.city || "",
            data: data?.data,
          };
        } catch (err) {
          console.error(`Error fetching business ${id}:`, err);
          return null;
        }
      })
    );
    
    return venues.filter(Boolean);
  } catch (err: any) {
    console.error("Error fetching multiple venues:", err);
    return null;
  }
}

// Get all services (haircut, beard trim, etc.)
export async function getServices() {
  try {
    const { data } = await reservio.get(
      `/businesses/${process.env.BUSINESS_ID}/services`
    );
    return data;
  } catch (err: any) {
    console.error(
      "Error fetching services:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Get all resources/staff members (barbers)
export async function getResources() {
  try {
    const { data } = await reservio.get(
      `/businesses/${process.env.BUSINESS_ID}/resources`
    );
    return data;
  } catch (err: any) {
    console.error(
      "Error fetching resources:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Get available slots for the next 3 days
export async function getAvailableSlots(
  serviceId: string,
  from?: string,
  to?: string
) {
  try {
    // default window: start of today → end of +3 days (in business timezone)
    const fromIso = from ?? dayjs().tz(BUSINESS_TZ).startOf("day").format();
    const toIso =
      to ?? dayjs().tz(BUSINESS_TZ).add(3, "day").endOf("day").format();

    const { data } = await reservio.get(
      `/businesses/${process.env.BUSINESS_ID}/availability/booking-slots`,
      {
        params: {
          "filter[from]": fromIso,
          "filter[to]": toIso,
          "filter[serviceId]": serviceId,
          "filter[resourceId]": process.env.RESOURCE_ID,
        },
      }
    );

    // Filter out past slots relative to now
    const now = dayjs();
    const filteredSlots = data?.data?.filter((slot: any) =>
      dayjs(slot.attributes.start).isAfter(now)
    );

    // Return in the same shape as other helper functions so callers can use slotsData.data
    return { ...data, data: filteredSlots };
  } catch (err: any) {
    console.error("Error fetching slots:", err.response?.data || err.message);
    throw err;
  }
}

// Create a new booking
export async function createBooking(
  serviceId: string,
  slot: { start: string; end: string },
  clientName: string,
  clientEmail: string,
  clientPhone: string
) {
  try {
    console.log(`🔵 Reservio API - createBooking called with:`);
    console.log(`   Name: ${clientName}`);
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Phone: ${clientPhone}`);
    
    const payload = {
      data: {
        type: "booking",
        attributes: {
          bookedClientName: clientName,
          note: "",
          via: "application", // Required field indicating booking source (application or minipage)
        },
        relationships: {
          event: {
            data: {
              type: "event",
              attributes: {
                start: slot.start,
                end: slot.end,
                name: clientName,
                eventType: "appointment",
              },
              relationships: {
                service: {
                  data: {
                    type: "service",
                    id: serviceId,
                  },
                },
              },
            },
          },
          client: {
            data: {
              type: "client",
              attributes: {
                name: clientName,
                email: clientEmail,
                phone: clientPhone,
              },
            },
          },
        },
      },
    };

    console.log(`📤 Sending payload to Reservio:`, JSON.stringify(payload, null, 2));

    const { data } = await reservio.post(
      `/businesses/${process.env.BUSINESS_ID}/bookings`,
      payload
    );
    
    console.log(`📥 Reservio response:`, JSON.stringify(data, null, 2));
    
    return data;
  } catch (err: any) {
    console.error("Error creating booking:", err.response?.data || err.message);
    if (err.response?.data) {
      console.error("Full error response:", JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}
