'use client';

import React, { Suspense } from 'react';
import { ArenaAlunoView } from '@/components/arena/ArenaAlunoView';
import { Loader2 } from 'lucide-react';

export default function ArenaAlunoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ArenaAlunoView />
    </Suspense>
  );
}

