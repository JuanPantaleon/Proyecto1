'use client';

import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className={cn('sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border')}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
          </Button>

          <UserButton />
        </div>
      </div>
    </header>
  );
}