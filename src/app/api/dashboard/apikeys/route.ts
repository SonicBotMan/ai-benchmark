import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ apiKeys });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body as { name: string };

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const keyCount = await prisma.apiKey.count({
    where: { userId: session.user.id },
  });

  if (keyCount >= 10) {
    return NextResponse.json({ error: 'Maximum of 10 API keys reached' }, { status: 400 });
  }

  const key = `bm_live_${nanoid(32)}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      key,
      name: name.trim(),
    },
  });

  return NextResponse.json({
    apiKey: {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
    },
  });
}
