import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { BusinessConfig, getBusinessById } from "./businesses.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const API = "https://api.reservio.com/v2";

const BUSINESS_TZ =
  process.env.BUSINESS_TIMEZONE ||
  process.env.RESERVIO_TIMEZONE ||
  "Europe/Prague";

// Read-only mode flag - prevents creating real bookings during testing
const READ_ONLY_MODE = process.env.READ_ONLY_MODE === 'true';

// Current business context (can be changed per session)
let currentBusiness: BusinessConfig | null = null;

// Create axios instance dynamically based on current business
function createReservioClient(business: BusinessConfig): AxiosInstance {
  return axios.create({
    baseURL: API,
    headers: {
      Authorization: `Bearer ${business.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

// Default client (for backward compatibility - will be replaced with business-specific clients)
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

/**
 * Set the current business context for API calls
 */
export function setCurrentBusiness(businessId: string): BusinessConfig | null {
  const business = getBusinessById(businessId);
  if (business) {
    currentBusiness = business;
    console.log(`🏢 Current business set to: ${business.name} (${business.category})`);
  } else {
    console.error(`❌ Business not found: ${businessId}`);
  }
  return currentBusiness;
}

/**
 * Get the current business context
 */
export function getCurrentBusiness(): BusinessConfig | null {
  return currentBusiness;
}

/**
 * Get the appropriate Reservio client for the current business
 */
function getReservioClient(): AxiosInstance {
  if (currentBusiness) {
    return createReservioClient(currentBusiness);
  }
  // Fallback to default client if no business is set
  return reservio;
}

/**
 * Get current business ID (supports both new multi-business and legacy single-business mode)
 */
function getCurrentBusinessId(): string {
  if (currentBusiness) {
    return currentBusiness.id;
  }
  // Fallback to environment variable for backward compatibility
  return process.env.BUSINESS_ID || process.env.RESERVIO_BUSINESS_ID || '';
}

// Get business info (name, address, etc.)
export async function getBusiness(businessId?: string) {
  try {
    const id = businessId || getCurrentBusinessId();
    if (!id)
      throw new Error(
        "Missing BUSINESS_ID / RESERVIO_BUSINESS_ID environment variable or current business not set"
      );

    const client = getReservioClient();
    const { data } = await client.get(`/businesses/${id}`);
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

// Get multiple venues - DEPRECATED in favor of getBusinessesByCategory
// Kept for backward compatibility but now uses the new businesses.ts config
export async function getMultipleVenues() {
  console.warn('getMultipleVenues() is deprecated. Use getBusinessesByCategory() from businesses.ts instead.');
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
          const business = getBusinessById(id);
          if (business) {
            const client = createReservioClient(business);
            const { data } = await client.get(`/businesses/${id}`);
            return {
              id,
              name: data?.data?.attributes?.name || "Unknown",
              address: formatAddress(data?.data?.attributes),
              city: data?.data?.attributes?.city || "",
              data: data?.data,
            };
          }
          return null;
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
export async function getServices(businessId?: string) {
  try {
    const id = businessId || getCurrentBusinessId();
    if (!id) throw new Error("Business ID not set");

    const client = getReservioClient();
    const { data } = await client.get(`/businesses/${id}/services`);
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
export async function getResources(businessId?: string) {
  try {
    const id = businessId || getCurrentBusinessId();
    if (!id) throw new Error("Business ID not set");

    const client = getReservioClient();
    const { data } = await client.get(`/businesses/${id}/resources`);
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
  to?: string,
  businessId?: string
) {
  try {
    const id = businessId || getCurrentBusinessId();
    if (!id) throw new Error("Business ID not set");

    // default window: start of today → end of +3 days (in business timezone)
    const fromIso = from ?? dayjs().tz(BUSINESS_TZ).startOf("day").format();
    const toIso =
      to ?? dayjs().tz(BUSINESS_TZ).add(3, "day").endOf("day").format();

    const client = getReservioClient();
    const { data } = await client.get(
      `/businesses/${id}/availability/booking-slots`,
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
  clientPhone: string,
  businessId?: string
) {
  try {
    const id = businessId || getCurrentBusinessId();
    if (!id) throw new Error("Business ID not set");

    const businessName = currentBusiness?.name || 'the business';
    
    console.log(`🔵 Reservio API - createBooking called with:`);
    console.log(`   Business: ${businessName} (${id})`);
    console.log(`   Name: ${clientName}`);
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Phone: ${clientPhone}`);
    console.log(`   Slot: ${slot.start} to ${slot.end}`);
    
    // ⚠️ READ-ONLY MODE PROTECTION
    if (READ_ONLY_MODE) {
      console.log(`⚠️  READ-ONLY MODE: Booking NOT created (prevented by READ_ONLY_MODE flag)`);
      console.log(`📋 Would have created booking with:`);
      console.log(`   - Business: ${businessName}`);
      console.log(`   - Service ID: ${serviceId}`);
      console.log(`   - Client: ${clientName} (${clientEmail})`);
      console.log(`   - Phone: ${clientPhone}`);
      console.log(`   - Time: ${slot.start} to ${slot.end}`);
      
      // Return a mock successful response
      return {
        data: {
          id: 'TEST_BOOKING_' + Date.now(),
          type: 'booking',
          attributes: {
            bookedClientName: clientName,
            note: 'TEST MODE - No actual booking created',
          }
        },
        meta: {
          testMode: true,
          message: 'READ-ONLY MODE: No actual booking was created'
        }
      };
    }
    
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

    const client = getReservioClient();
    const { data } = await client.post(
      `/businesses/${id}/bookings`,
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
