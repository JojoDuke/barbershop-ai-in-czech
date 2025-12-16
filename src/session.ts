interface Session {
  step: string;
  service?: string;
  duration?: number;
  availableSlots?: string[];
  chosenSlot?: string;
  name?: string;
  // Multi-business support
  selectedBusinessId?: string;
  selectedCategory?: 'hair_salon' | 'physiotherapy';
  selectedBusinessName?: string;
}

const sessions: Record<string, Session> = {};

export function getSession(user: string): Session {
  if (!sessions[user]) {
    sessions[user] = { step: "greeting" };
  }
  return sessions[user];
}

export function updateSession(user: string, data: Partial<Session>) {
  sessions[user] = { ...getSession(user), ...data };
}

export function clearSession(user: string) {
  delete sessions[user];
}

/**
 * Get the selected business ID from a session
 */
export function getSelectedBusinessId(user: string): string | undefined {
  return sessions[user]?.selectedBusinessId;
}

/**
 * Get the selected category from a session
 */
export function getSelectedCategory(user: string): 'hair_salon' | 'physiotherapy' | undefined {
  return sessions[user]?.selectedCategory;
}
