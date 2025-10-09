import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertUser(phone: string, name: string, email: string) {
  try {
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        name,
        email,
      },
      create: {
        phone,
        name,
        email,
      },
    });
    return user;
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function createBookingRecord(
  userId: string,
  serviceId: string,
  slotStart: string,
  slotEnd: string
) {
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        slotStart: new Date(slotStart),
        slotEnd: new Date(slotEnd),
        status: "confirmed",
      },
    });
    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export { prisma };
