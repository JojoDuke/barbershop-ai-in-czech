import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUser() {
  const phone = process.argv[2]; // e.g., "+233240369071"

  if (!phone) {
    console.error("\n❌ Usage: npx tsx delete-user.ts <phone>");
    console.error("Example: npx tsx delete-user.ts +233240369071\n");
    process.exit(1);
  }

  try {
    // First delete all bookings for this user
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { bookings: true },
    });

    if (!user) {
      console.error(`\n❌ No user found with phone: ${phone}\n`);
      process.exit(1);
    }

    console.log(`\n🗑️  Deleting user: ${user.name || "No name"}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Bookings: ${user.bookings.length}`);

    // Delete bookings first (foreign key constraint)
    await prisma.booking.deleteMany({
      where: { userId: user.id },
    });

    // Then delete user
    await prisma.user.delete({
      where: { phone },
    });

    console.log("\n✅ User and all bookings deleted successfully!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
  }

  await prisma.$disconnect();
}

deleteUser();

