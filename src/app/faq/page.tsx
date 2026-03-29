'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { faqData, faqCategories } from '@/data/faq-data';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">常见问题</h1>
          <p className="mt-2 text-muted-foreground">
            快速找到你想要的答案
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索问题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </Button>
          {faqCategories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFAQ.map(item => (
            <Card key={item.id}>
              <CardContent className="py-4">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div>
                    <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="font-medium">{item.question}</span>
                  </div>
                  {expandedId === item.id ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {expandedId === item.id && (
                  <div className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            没有找到匹配的问题
          </div>
        )}
      </div>
    </div>
  );
}
