// Test script to check how many barbers/resources are in the Reservio API
import dotenv from "dotenv";
import { getResources } from "./reservio";

// Load environment variables
dotenv.config();

async function testResources() {
  try {
    console.log("🔍 Fetching resources from Reservio...\n");
    
    const resources = await getResources();
    
    if (!resources?.data) {
      console.log("❌ No resources found or API returned unexpected format");
      console.log("Full response:", JSON.stringify(resources, null, 2));
      return;
    }
    
    const resourceCount = resources.data.length;
    console.log(`✅ Found ${resourceCount} barber(s)/resource(s):\n`);
    
    resources.data.forEach((resource: any, index: number) => {
      console.log(`${index + 1}. ${resource.attributes?.name || 'Unnamed'}`);
      console.log(`   ID: ${resource.id}`);
      console.log(`   Type: ${resource.type}`);
      if (resource.attributes?.email) {
        console.log(`   Email: ${resource.attributes.email}`);
      }
      console.log();
    });
    
    // Show which resource is currently configured
    const configuredResourceId = process.env.RESOURCE_ID;
    if (configuredResourceId) {
      console.log(`📌 Currently configured RESOURCE_ID in .env: ${configuredResourceId}`);
      const matchingResource = resources.data.find((r: any) => r.id === configuredResourceId);
      if (matchingResource) {
        console.log(`   ✓ Matches: ${matchingResource.attributes?.name || 'Resource found'}`);
      } else {
        console.log(`   ⚠️ Warning: This RESOURCE_ID doesn't match any available resource!`);
      }
    } else {
      console.log(`⚠️ No RESOURCE_ID configured in environment variables`);
    }
    
  } catch (error: any) {
    console.error("❌ Error fetching resources:");
    console.error(error.message);
    if (error.response?.data) {
      console.error("API error details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

testResources();

