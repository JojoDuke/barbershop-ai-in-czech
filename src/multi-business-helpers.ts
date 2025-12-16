/**
 * Helper functions for multi-business operations
 * Used for aggregating services and availability across multiple businesses
 */

import { getServices, getAvailableSlots } from "./reservio.js";
import { getBusinessesByCategory, type BusinessConfig } from "./businesses.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Service with business context
 */
export interface ServiceWithBusiness {
  service: any;
  business: BusinessConfig;
  businessId: string;
  businessName: string;
}

/**
 * Aggregated service (multiple businesses offering similar service)
 */
export interface AggregatedService {
  name: string;
  duration?: number;
  businesses: BusinessConfig[];
  services: ServiceWithBusiness[];
}

/**
 * Get all services from all businesses in a category
 */
export async function getServicesForCategory(
  category: 'hair_salon' | 'physiotherapy'
): Promise<ServiceWithBusiness[]> {
  const businesses = getBusinessesByCategory(category);
  const allServices: ServiceWithBusiness[] = [];

  for (const business of businesses) {
    try {
      const servicesData = await getServices(business.id);
      const services = servicesData?.data || [];

      for (const service of services) {
        allServices.push({
          service,
          business,
          businessId: business.id,
          businessName: business.name,
        });
      }
    } catch (error) {
      console.error(`Error fetching services for ${business.name}:`, error);
    }
  }

  return allServices;
}

/**
 * Use AI to group similar services across businesses
 * For example: "Haircut" and "Hair Cut" and "Men's Haircut" should be grouped
 */
export async function aggregateServices(
  services: ServiceWithBusiness[]
): Promise<AggregatedService[]> {
  if (services.length === 0) return [];
  
  // If only one business, no need to aggregate
  const uniqueBusinesses = new Set(services.map(s => s.businessId));
  if (uniqueBusinesses.size === 1) {
    return services.map(s => ({
      name: s.service.attributes.name,
      duration: s.service.attributes.duration,
      businesses: [s.business],
      services: [s],
    }));
  }

  // Use AI to group similar services
  try {
    const serviceList = services.map((s, idx) => 
      `${idx}: "${s.service.attributes.name}" from ${s.businessName}`
    ).join('\n');

    const systemPrompt = `You are a service aggregator. Group similar services together.

Services:
${serviceList}

Group services that are essentially the same (e.g., "Haircut" and "Hair Cut" are the same).
Respond with JSON array of groups, where each group has:
- "name": A normalized name for the service
- "indices": Array of service indices that belong to this group

Example output:
[
  {"name": "Haircut", "indices": [0, 3, 5]},
  {"name": "Beard Trim", "indices": [1, 4]},
  {"name": "Massage", "indices": [2]}
]`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Group these services" },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content?.trim();
    if (response) {
      const parsed = JSON.parse(response);
      const groups = parsed.groups || parsed;
      
      const aggregated: AggregatedService[] = [];
      for (const group of groups) {
        const groupServices = group.indices.map((idx: number) => services[idx]);
        const uniqueBiz = Array.from(new Set(groupServices.map((s: ServiceWithBusiness) => s.business)));
        
        aggregated.push({
          name: group.name,
          duration: groupServices[0]?.service.attributes.duration,
          businesses: uniqueBiz,
          services: groupServices,
        });
      }
      
      return aggregated;
    }
  } catch (error) {
    console.error("AI service aggregation error:", error);
  }

  // Fallback: No aggregation, just list all services
  return services.map(s => ({
    name: s.service.attributes.name,
    duration: s.service.attributes.duration,
    businesses: [s.business],
    services: [s],
  }));
}

/**
 * Get availability for a service across multiple businesses
 */
export async function getAvailabilityAcrossBusinesses(
  serviceId: string,
  businessIds: string[],
  from?: string,
  to?: string
): Promise<Array<{ businessId: string; businessName: string; slots: any[] }>> {
  const results = [];

  for (const businessId of businessIds) {
    try {
      const slotsData = await getAvailableSlots(serviceId, from, to, businessId);
      const business = getBusinessesByCategory('hair_salon')
        .concat(getBusinessesByCategory('physiotherapy'))
        .find(b => b.id === businessId);

      results.push({
        businessId,
        businessName: business?.name || 'Unknown',
        slots: slotsData?.data || [],
      });
    } catch (error) {
      console.error(`Error fetching slots for business ${businessId}:`, error);
    }
  }

  return results;
}

