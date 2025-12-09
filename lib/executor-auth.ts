import { createServerClient } from './auth';
import bcrypt from 'bcryptjs';

export interface ExecutorSession {
  userId: string;
  executorContactId: string;
  permissions: {
    canViewPersonalDetails: boolean;
    canViewMedicalContacts: boolean;
    canViewFuneralPreferences: boolean;
    canViewDocuments: boolean;
    canViewLetters: boolean;
  };
}

// Simple in-memory store for executor sessions (in production, use Redis or database)
const executorSessions = new Map<string, ExecutorSession & { expiresAt: Date }>();

export function createExecutorSession(
  token: string,
  userId: string,
  executorContactId: string,
  permissions: ExecutorSession['permissions']
): void {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  executorSessions.set(token, {
    userId,
    executorContactId,
    permissions,
    expiresAt,
  });

  // Clean up expired sessions periodically
  setTimeout(() => {
    const now = new Date();
    for (const [key, session] of executorSessions.entries()) {
      if (session.expiresAt < now) {
        executorSessions.delete(key);
      }
    }
  }, 60 * 60 * 1000); // Clean up every hour
}

export function getExecutorSession(token: string): ExecutorSession | null {
  const session = executorSessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    executorSessions.delete(token);
    return null;
  }

  return {
    userId: session.userId,
    executorContactId: session.executorContactId,
    permissions: session.permissions,
  };
}

export async function verifyExecutorAccess(
  token: string | null,
  requiredPermission?: keyof ExecutorSession['permissions']
): Promise<{ error: string; status: number } | ExecutorSession> {
  if (!token) {
    return { error: 'Executor token required', status: 401 };
  }

  const session = getExecutorSession(token);
  if (!session) {
    return { error: 'Invalid or expired executor session', status: 401 };
  }

  if (requiredPermission && !session.permissions[requiredPermission]) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return session;
}

