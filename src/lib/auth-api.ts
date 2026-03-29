import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

interface AuthResult {
  apiKey: {
    id: string;
    key: string;
    userId: string;
  };
}

export async function validateApiKey(req: NextRequest): Promise<AuthResult | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: token },
  });

  if (!apiKey) {
    return null;
  }

  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { apiKey };
}

export function requireEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return key;
}
