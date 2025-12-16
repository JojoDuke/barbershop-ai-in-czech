/**
 * Multi-Business Configuration
 * 
 * This file contains configuration for all businesses managed by the AI booking bot.
 * Each business has its own API endpoint and access token for the Reservio API.
 * 
 * ⚠️ SECURITY NOTE: In production, these tokens should be stored in environment variables
 * or a secure secrets management system. They are hardcoded here for development convenience.
 */

export interface BusinessConfig {
  id: string;
  name: string;
  category: 'hair_salon' | 'physiotherapy';
  apiEndpoint: string;
  accessToken: string;
  isLive: boolean; // Flag to indicate this is a real, active business
  description?: string;
}

export const BUSINESSES: BusinessConfig[] = [
  {
    id: 'd709a085-8c00-4bea-af6c-438e5741521a',
    name: 'Barbershop',
    category: 'hair_salon',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/d709a085-8c00-4bea-af6c-438e5741521a',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImIyYTYzMmM0YWE1ZDRkMzhjMjZhMjkwYTg1YjFlNjIxN2U4OTMwM2U5OTMwODNiMDI1MWJiMTlkMmQxNTQxOTNjZmFhNmM5NGUwZjgzM2Q5In0.eyJhdWQiOiI1ZWI3ODIyZC1iMGNiLTQyZTItYTIwYS1kMTFjNjc4ZjNhM2MiLCJqdGkiOiJiMmE2MzJjNGFhNWQ0ZDM4YzI2YTI5MGE4NWIxZTYyMTdlODkzMDNlOTkzMDgzYjAyNTFiYjE5ZDJkMTU0MTkzY2ZhYTZjOTRlMGY4MzNkOSIsImlhdCI6MTc2NDY1NzA4NCwibmJmIjoxNzY0NjU3MDg0LCJleHAiOjE5MjI0MjM0ODQsInN1YiI6IjE3NDMyMzEiLCJzY29wZXMiOlsiYWRtaW4iXX0.C6LginUEaxF_vkOzIMfO4uaUNFhht4PtJmxjenXUNz_R8_E3xobKqvVPANud-1qSqn2FF67dRf1MSW_ALHae4IhuYUIeZ4stTD7qJAIEiIj4aZtThMi4Eun1ZQ-65vwk1A1FOu8RR8O1kbCNRBNpy6BUh190x74F_sTp6rcNkW4',
    isLive: true,
    description: 'Professional barbershop services including haircuts, beard trims, and styling'
  },
  {
    id: 'fc376586-8906-4c0a-8cd3-be382a3c4a89',
    name: 'Physiotherapy Clinic',
    category: 'physiotherapy',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/fc376586-8906-4c0a-8cd3-be382a3c4a89',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjUwNDA5ZGZiMjQ0MTA0YjAwZjIzZjFmNTFlZDJlMjhlNjFlNTA3NmZkZTg4MWVkNzc5MjE2ZTBmMjVlMTJkYTMzNzY4NGRjNzU0NDk4OTQ4In0.eyJhdWQiOiI1ZWI3ODIyZC1iMGNiLTQyZTItYTIwYS1kMTFjNjc4ZjNhM2MiLCJqdGkiOiI1MDQwOWRmYjI0NDEwNGIwMGYyM2YxZjUxZWQyZTI4ZTYxZTUwNzZmZGU4ODFlZDc3OTIxNmUwZjI1ZTEyZGEzMzc2ODRkYzc1NDQ5ODk0OCIsImlhdCI6MTc2Mzk3NDkwOCwibmJmIjoxNzYzOTc0OTA4LCJleHAiOjE5MjE3NDEzMDcsInN1YiI6IjIxMDczMDIiLCJzY29wZXMiOlsiYWRtaW4iXX0.A_814ubc_9Patd_015K0kIDV_CJIBXuX79Uk0d3A0mA7tphs4ZtrqgWgTZphfWTKS_zOXsNKYUUvGLvLr_0mE3ftmtXuUi-WDQcAYhtSz3En_Bx7bDipCgX66ViNi2dVTqaL9Jqya4bKjqPElwSEo4arxX_VPfLdS4Q4peT0ELo',
    isLive: true,
    description: 'Professional physiotherapy services including massage, rehabilitation, and therapy'
  }
];

/**
 * Get all businesses
 */
export function getAllBusinesses(): BusinessConfig[] {
  return BUSINESSES;
}

/**
 * Get business by ID
 */
export function getBusinessById(id: string): BusinessConfig | undefined {
  return BUSINESSES.find(b => b.id === id);
}

/**
 * Get businesses by category
 */
export function getBusinessesByCategory(category: 'hair_salon' | 'physiotherapy'): BusinessConfig[] {
  return BUSINESSES.filter(b => b.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): Array<'hair_salon' | 'physiotherapy'> {
  const categories = new Set(BUSINESSES.map(b => b.category));
  return Array.from(categories);
}

/**
 * Category display names for user-facing messages
 */
export const CATEGORY_NAMES: Record<string, { en: string; cs: string; description: string }> = {
  hair_salon: {
    en: 'Hair Salon',
    cs: 'Kadeřnictví',
    description: 'Haircuts, styling, beard trims, and grooming services'
  },
  physiotherapy: {
    en: 'Physiotherapy',
    cs: 'Fyzioterapie',
    description: 'Massage, rehabilitation, therapy, and wellness services'
  }
};

/**
 * Get category display name
 */
export function getCategoryName(category: string, language: 'en' | 'cs' = 'en'): string {
  return CATEGORY_NAMES[category]?.[language] || category;
}

/**
 * Get category description
 */
export function getCategoryDescription(category: string): string {
  return CATEGORY_NAMES[category]?.description || '';
}

