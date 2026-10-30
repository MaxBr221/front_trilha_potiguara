'use client';

import React, { Suspense, use } from 'react';
import { ArenaAlunoView } from '@/components/arena/ArenaAlunoView';
import { Loader2 } from 'lucide-react';

export default function ArenaAlunoPinPage({ params }: { params: Promise<{ pin: string }> }) {
  const resolvedParams = use(params);
  const pin = resolvedParams.pin;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ArenaAlunoView pinParam={pin} />
    </Suspense>
  );
}

