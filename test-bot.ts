import dotenv from "dotenv";
dotenv.config();

import { handleMessage } from "./src/chat.js";

// Test phone number (can be any string for testing)
const TEST_PHONE = "+420123456789";

async function runTest(testName: string, message: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`TEST: ${testName}`);
  console.log(`INPUT: "${message}"`);
  console.log(`${"=".repeat(50)}`);
  
  try {
    const response = await handleMessage(TEST_PHONE, message);
    console.log(`\nRESPONSE:\n${response}`);
  } catch (error) {
    console.error(`\nERROR:`, error);
  }
  
  // Small delay between tests
  await new Promise(resolve => setTimeout(resolve, 500));
}

async function main() {
  console.log("🤖 Starting Bot Tests...\n");
  console.log("Note: Make sure your .env file is configured with:");
  console.log("  - OPENAI_API_KEY");
  console.log("  - RESERVIO_API_KEY");
  console.log("  - BUSINESS_ID");
  console.log("  - RESOURCE_ID\n");

  // Test 1: Enhanced Greeting
  await runTest("1. Enhanced Greeting", "hi");
  
  // Test 2: Business Info Request
  await runTest("2. Business Info Request", "what are your hours?");
  
  // Test 3: Service Selection (exact match)
  await runTest("3. Service Selection (exact)", "haircut");
  
  // Test 4: Service Selection (variation - uncomment if you have a service with "beard" in name)
  // await runTest("4. Service Selection (variation)", "beard");
  
  // Test 5: Date Selection
  await runTest("5. Date Selection", "tomorrow");
  
  // Test 6: Time Selection
  // Note: This will only work if there are available slots
  // You may need to adjust the time based on your actual availability
  await runTest("6. Time Selection", "10:00 AM");
  
  // Test 7: Contact Info
  await runTest("7. Contact Info", "John Doe, john@example.com");
  
  // Test 8: Booking Confirmation
  await runTest("8. Booking Confirmation", "yes");
  
  // Test 9: Second Booking (should use saved info)
  console.log("\n\n=== Starting Second Booking (Testing Persistence) ===");
  await runTest("9a. Second Greeting (should show welcome back)", "hi");
  await runTest("9b. Service Selection", "haircut");
  await runTest("9c. Date Selection", "next Friday");
  // Continue with time selection if slots are available
  
  console.log("\n\n✅ Tests completed!");
  console.log("\n💡 Tip: You can modify this script to test specific scenarios.");
  console.log("💡 Tip: Check the console for debug logs during execution.");
}

main().catch(console.error);

