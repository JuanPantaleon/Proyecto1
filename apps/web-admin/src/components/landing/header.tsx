'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50',
      'bg-black/80 backdrop-blur-xl border-b border-gray-800/50'
    )}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Ranked Fitness Home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Ranked Fitness</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="#inicio" className="text-gray-300 hover:text-white transition-colors">Inicio</Link>
          <Link href="#ranking" className="text-gray-300 hover:text-white transition-colors">Ranking</Link>
          <Link href="#atletas" className="text-gray-300 hover:text-white transition-colors">Atletas</Link>
          <Link href="#entrenadores" className="text-gray-300 hover:text-white transition-colors">Entrenadores</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = 'https://moved-possum-7025.accounts.dev/sign-in'}>
            Ingresar
          </Button>
          <Button size="sm" onClick={() => window.location.href = 'https://moved-possum-7025.accounts.dev/sign-up'}>
            Unirse
          </Button>
        </div>
      </div>
    </header>
  );
}