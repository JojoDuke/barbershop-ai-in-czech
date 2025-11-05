import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUserEmail() {
  const phone = process.argv[2]; // e.g., "+233240369071"
  const newEmail = process.argv[3]; // e.g., "fontsnatcher@gmail.com"

  if (!phone || !newEmail) {
    console.error("\n❌ Usage: npx tsx update-user-email.ts <phone> <email>");
    console.error("Example: npx tsx update-user-email.ts +233240369071 fontsnatcher@gmail.com\n");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { phone },
      data: { email: newEmail },
    });

    console.log("\n✅ User updated successfully!");
    console.log(`   Phone: ${user.phone}`);
    console.log(`   New Email: ${user.email}\n`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    console.error("   Make sure the phone number exists in the database.\n");
  }

  await prisma.$disconnect();
}

updateUserEmail();

