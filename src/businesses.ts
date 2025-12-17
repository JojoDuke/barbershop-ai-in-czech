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
  category: 'barbershop' | 'physiotherapy';
  apiEndpoint: string;
  accessToken: string;
  isLive: boolean; // Flag to indicate this is a real, active business
  description?: string;
  address?: string; // Display address for business selection
  isDefault?: boolean; // Default business for direct booking intents (Rico Studio)
}

export const BUSINESSES: BusinessConfig[] = [
  {
    id: 'ef525423-dabf-4750-bf11-dc5182d68695',
    name: 'Rico Studio',
    category: 'barbershop',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/ef525423-dabf-4750-bf11-dc5182d68695',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjVmNWJlODc5MzkwYTI0ZjgxOTNhZGFmYmE5MTk2ZjNhMTM5Nzk3YTg3ODI5YWQ5ODI2NzJhZWJmNDU4YTliNDBlOThmMzE0OTZlOTZiMTExIn0.eyJhdWQiOiI1ZWI3ODIyZC1iMGNiLTQyZTItYTIwYS1kMTFjNjc4ZjNhM2MiLCJqdGkiOiI1ZjViZTg3OTM5MGEyNGY4MTkzYWRhZmJhOTE5NmYzYTEzOTc5N2E4NzgyOWFkOTgyNjcyYWViZjQ1OGE5YjQwZTk4ZjMxNDk2ZTk2YjExMSIsImlhdCI6MTc1OTI5NTc2MSwibmJmIjoxNzU5Mjk1NzYxLCJleHAiOjE5MTcwNjIxNjEsInN1YiI6IjQzNzc1MzIiLCJzY29wZXMiOlsiYWRtaW4iXX0.jTF1NhZ2OOKnCCa65SdfQA7Ro78Zo3InY6zoJGaX_u29dl5f-wA8VLhRE01OFU5MFLBNGLXDcDxPpJKJ4QjW4WJTYC4R3FLx4BOKISxKfozkShY_IgUalyv5ma0--B5cIaghYQDoYBiFnF9erdtNuzpJrLjDLFr_KOAZsDQD6Io',
    isLive: true,
    isDefault: true, // Default barbershop for direct booking intents (backward compatibility)
    address: 'Prague, Czech Republic', // TODO: Get actual address from API
    description: 'Professional barbershop services including haircuts, beard trims, and styling'
  },
  {
    id: 'd709a085-8c00-4bea-af6c-438e5741521a',
    name: 'Holičství 21',
    category: 'barbershop',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/d709a085-8c00-4bea-af6c-438e5741521a',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImIyYTYzMmM0YWE1ZDRkMzhjMjZhMjkwYTg1YjFlNjIxN2U4OTMwM2U5OTMwODNiMDI1MWJiMTlkMmQxNTQxOTNjZmFhNmM5NGUwZjgzM2Q5In0.eyJhdWQiOiI1ZWI3ODIyZC1iMGNiLTQyZTItYTIwYS1kMTFjNjc4ZjNhM2MiLCJqdGkiOiJiMmE2MzJjNGFhNWQ0ZDM4YzI2YTI5MGE4NWIxZTYyMTdlODkzMDNlOTkzMDgzYjAyNTFiYjE5ZDJkMTU0MTkzY2ZhYTZjOTRlMGY4MzNkOSIsImlhdCI6MTc2NDY1NzA4NCwibmJmIjoxNzY0NjU3MDg0LCJleHAiOjE5MjI0MjM0ODQsInN1YiI6IjE3NDMyMzEiLCJzY29wZXMiOlsiYWRtaW4iXX0.C6LginUEaxF_vkOzIMfO4uaUNFhht4PtJmxjenXUNz_R8_E3xobKqvVPANud-1qSqn2FF67dRf1MSW_ALHae4IhuYUIeZ4stTD7qJAIEiIj4aZtThMi4Eun1ZQ-65vwk1A1FOu8RR8O1kbCNRBNpy6BUh190x74F_sTp6rcNkW4',
    isLive: true,
    address: 'Prague, Czech Republic', // TODO: Get actual address from API
    description: 'Professional barbershop services including haircuts, beard trims, and styling'
  },
  {
    id: 'fc376586-8906-4c0a-8cd3-be382a3c4a89',
    name: 'Anatomic Fitness',
    category: 'physiotherapy',
    apiEndpoint: 'https://api.reservio.com/v2/businesses/fc376586-8906-4c0a-8cd3-be382a3c4a89',
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjUwNDA5ZGZiMjQ0MTA0YjAwZjIzZjFmNTFlZDJlMjhlNjFlNTA3NmZkZTg4MWVkNzc5MjE2ZTBmMjVlMTJkYTMzNzY4NGRjNzU0NDk4OTQ4In0.eyJhdWQiOiI1ZWI3ODIyZC1iMGNiLTQyZTItYTIwYS1kMTFjNjc4ZjNhM2MiLCJqdGkiOiI1MDQwOWRmYjI0NDEwNGIwMGYyM2YxZjUxZWQyZTI4ZTYxZTUwNzZmZGU4ODFlZDc3OTIxNmUwZjI1ZTEyZGEzMzc2ODRkYzc1NDQ5ODk0OCIsImlhdCI6MTc2Mzk3NDkwOCwibmJmIjoxNzYzOTc0OTA4LCJleHAiOjE5MjE3NDEzMDcsInN1YiI6IjIxMDczMDIiLCJzY29wZXMiOlsiYWRtaW4iXX0.A_814ubc_9Patd_015K0kIDV_CJIBXuX79Uk0d3A0mA7tphs4ZtrqgWgTZphfWTKS_zOXsNKYUUvGLvLr_0mE3ftmtXuUi-WDQcAYhtSz3En_Bx7bDipCgX66ViNi2dVTqaL9Jqya4bKjqPElwSEo4arxX_VPfLdS4Q4peT0ELo',
    isLive: true,
    address: 'Prague, Czech Republic', // TODO: Get actual address from API
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
export function getBusinessesByCategory(category: 'barbershop' | 'physiotherapy'): BusinessConfig[] {
  return BUSINESSES.filter(b => b.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): Array<'barbershop' | 'physiotherapy'> {
  const categories = new Set(BUSINESSES.map(b => b.category));
  return Array.from(categories);
}

/**
 * Get default business for a category (used for direct booking intents)
 */
export function getDefaultBusiness(category: 'barbershop' | 'physiotherapy'): BusinessConfig | null {
  const businesses = getBusinessesByCategory(category);
  const defaultBiz = businesses.find(b => b.isDefault);
  return defaultBiz || businesses[0] || null;
}

/**
 * Category display names for user-facing messages
 */
export const CATEGORY_NAMES: Record<string, { en: string; cs: string; description: string }> = {
  barbershop: {
    en: 'Barbershop',
    cs: 'Holičství',
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

/**
 * Get alternative businesses in the same category (excluding the specified business)
 * Useful for cross-shop availability checking
 */
export function getAlternativeBusinesses(currentBusinessId: string, category: 'barbershop' | 'physiotherapy'): BusinessConfig[] {
  return getBusinessesByCategory(category).filter(b => b.id !== currentBusinessId);
}

