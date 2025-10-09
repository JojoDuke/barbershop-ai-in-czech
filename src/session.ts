interface Session {
  step: string;
  service?: string;
  duration?: number;
  availableSlots?: string[];
  chosenSlot?: string;
  name?: string;
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
