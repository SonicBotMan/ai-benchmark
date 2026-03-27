import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    include: {
      apiKey: { select: { id: true, key: true, name: true } },
      evaluations: {
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 1,
        select: { totalScore: true, levelRating: true, completedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      platform: a.platform,
      modelBackbone: a.modelBackbone,
      description: a.description,
      apiKey: a.apiKey ? { id: a.apiKey.id, key: a.apiKey.key, name: a.apiKey.name } : null,
      latestScore: a.evaluations[0]?.totalScore ?? null,
      latestLevel: a.evaluations[0]?.levelRating ?? null,
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, platform, modelBackbone, description, apiKeyId } = body as {
    name: string;
    platform: string;
    modelBackbone: string;
    description?: string;
    apiKeyId?: string;
  };

  if (!name || !platform || !modelBackbone) {
    return NextResponse.json({ error: 'name, platform, modelBackbone are required' }, { status: 400 });
  }

  // Validate API key ownership if provided
  if (apiKeyId) {
    const key = await prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId: session.user.id },
    });
    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 400 });
    }
  }

  const agent = await prisma.agent.create({
    data: {
      name,
      platform,
      modelBackbone,
      description,
      userId: session.user.id,
      apiKeyId,
    },
  });

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      platform: agent.platform,
      modelBackbone: agent.modelBackbone,
      description: agent.description,
      createdAt: agent.createdAt,
    },
  });
}
