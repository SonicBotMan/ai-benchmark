import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        provider: true,
        slug: true,
        version: true,
      },
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Models error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
