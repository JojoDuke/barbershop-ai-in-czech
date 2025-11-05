import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("\n📊 All Users in Database:\n");
  
  const users = await prisma.user.findMany({
    include: {
      bookings: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || "No name"}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Email: ${user.email || "No email"}`);
    console.log(`   Bookings: ${user.bookings.length}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log("");
  });

  console.log(`Total users: ${users.length}\n`);
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);

