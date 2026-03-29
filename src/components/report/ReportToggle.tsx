'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Bot } from 'lucide-react';
import OwnerPerspective from './OwnerPerspective';
import BotPerspective from './BotPerspective';

interface ReportToggleProps {
  ownerPerspective: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  botPerspective: {
    greeting: string;
    selfAssessment: string;
    capabilities: string[];
    limitations: string[];
    goals: string[];
  };
}

export default function ReportToggle({ ownerPerspective, botPerspective }: ReportToggleProps) {
  const [view, setView] = useState<'owner' | 'bot'>('owner');

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <Button
          variant={view === 'owner' ? 'default' : 'outline'}
          onClick={() => setView('owner')}
          className="gap-2"
        >
          <User className="size-4" />
          主人视角
        </Button>
        <Button
          variant={view === 'bot' ? 'default' : 'outline'}
          onClick={() => setView('bot')}
          className="gap-2"
        >
          <Bot className="size-4" />
          Bot 自述
        </Button>
      </div>

      {view === 'owner' ? (
        <OwnerPerspective {...ownerPerspective} />
      ) : (
        <BotPerspective {...botPerspective} />
      )}
    </div>
  );
}
