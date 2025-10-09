import axios from "axios";
import dayjs from "dayjs";

const API = "https://api.reservio.com/v2";

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

// Get available slots for the next 3 days
export async function getAvailableSlots(
  serviceId: string,
  from?: string,
  to?: string
) {
  try {
    // default window: start of today → end of +3 days
    const fromIso = from ?? dayjs().startOf("day").toISOString();
    const toIso = to ?? dayjs().add(3, "day").endOf("day").toISOString();

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

    const { data } = await reservio.post(
      `/businesses/${process.env.BUSINESS_ID}/bookings`,
      payload
    );
    return data;
  } catch (err: any) {
    console.error("Error creating booking:", err.response?.data || err.message);
    throw err;
  }
}
