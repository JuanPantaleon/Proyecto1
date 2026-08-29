'use client';

import { Crown, Medal, Award, Trophy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const divisions = [
  { name: 'Elite', color: 'from-amber-500 to-amber-600', border: 'border-amber-400', icon: Crown, featured: true },
  { name: 'Diamante', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-400', icon: Trophy, featured: true },
  { name: 'Platino', color: 'from-slate-300 to-slate-500', border: 'border-slate-300', icon: Medal, featured: false },
  { name: 'Oro', color: 'from-amber-400 to-yellow-600', border: 'border-amber-400', icon: Trophy, featured: true },
  { name: 'Plata', color: 'from-gray-300 to-gray-500', border: 'border-gray-300', icon: Medal, featured: false },
  { name: 'Bronce', color: 'from-amber-700 to-orange-700', border: 'border-amber-700', icon: Award, featured: false },
];

export function DivisionsGrid() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-3 py-1.5 border-amber-400/30 text-amber-300">
            LIGAS Y DIVISIONES
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Asciende en el <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">Ranking Global</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Seis divisiones, una meta: la cima. Cada división desbloquea recompensas, coaches exclusivos y estatus en la comunidad.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {divisions.map((division, i) => (
            <div
              key={i}
              className={cn(
                'relative group p-8 rounded-3xl overflow-hidden transition-all duration-500',
                'bg-gradient-to-br from-gray-900/80 to-gray-950/60',
                'backdrop-blur-xl border border-gray-800/50',
                'hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(0,0,0,0.5)]',
                division.featured && 'ring-1 ring-amber-400/30 shadow-[0_0_40px_rgba(251,191,36,0.15)]',
                division.color.includes('amber') && 'hover:shadow-[0_0_40px_rgba(251,191,36,0.2)]'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={cn(
                'absolute top-4 right-4 w-16 h-16 rounded-2xl flex items-center justify-center',
                division.featured 
                  ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                  : 'bg-gray-800/50 text-gray-400'
              )}>
                <division.icon className="h-8 w-8" />
              </div>
              
              <div className="relative z-10 text-center mb-6">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">{division.name}</h3>
                {division.featured && (
                  <Badge variant="accent" className="mx-auto w-fit px-4 py-1.5 text-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    DIVISIÓN DE ÉLITE
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                  <div className="text-2xl font-bold text-amber-400">Top 0.1%</div>
                  <div className="text-xs text-gray-500">Percentil</div>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                  <div className="text-2xl font-bold text-red-400">ISG 95+</div>
                  <div className="text-xs text-gray-500">Score mínimo</div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Acceso a coaches Élite verificados',
                  'Misiones exclusivas semanales',
                  'Insignia de división en perfil',
                  'Prioridad en matchmaking de clanes',
                  division.featured && 'Acceso al Marketplace Premium',
                ].map((perk, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 group">
                    <Check className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={cn(
                  'w-full',
                  division.featured 
                    ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                )}
              >
                {division.featured ? 'Unirte a la Élite' : 'Ver Requisitos'}
              </Button>

              {division.featured && (
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] animate-pulse-subtle">
                  <Crown className="h-10 w-10 text-black" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}