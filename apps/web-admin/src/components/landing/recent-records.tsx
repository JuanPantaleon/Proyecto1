'use client';

import { Dumbbell, Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const recentPRs = [
  { user: 'Carlos R.', exercise: 'Peso Muerto', weight: '280kg', reps: '1', division: 'Diamante', time: '2h', rank: '#3' },
  { user: 'Sofia L.', exercise: 'Sentadilla', weight: '180kg', reps: '3', division: 'Oro', time: '4h', rank: '#12' },
  { user: 'Marco P.', exercise: 'Press Banca', weight: '160kg', reps: '2', division: 'Platino', time: '6h', rank: '#28' },
  { user: 'Elena K.', exercise: 'Dominadas', weight: '+50kg', reps: '5', division: 'Oro', time: '8h', rank: '#41' },
];

export function RecentRecords() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 gap-6">
          <div>
            <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
              COMUNIDAD ACTIVA
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Últimos <span className="text-red-400">Récords</span> y Retos
            </h2>
            <p className="text-lg text-gray-300 max-w-xl">
              La comunidad no para. Estos son los PRs más impresionantes de la semana.
            </p>
          </div>
          <Button variant="outline" className="w-full lg:w-auto">
            Ver Todos los Récords
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {recentPRs.map((pr, i) => (
            <Card
              key={i}
              className={cn(
                'relative p-6 rounded-3xl overflow-hidden transition-all duration-500',
                'bg-gradient-to-br from-gray-900/80 to-gray-950/60',
                'backdrop-blur-xl border border-gray-800/50',
                'hover:border-red-500/30 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] hover:scale-[1.01]'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{pr.user}</p>
                      <p className="text-sm text-gray-500">#{pr.rank.replace('#', '')} {pr.division}</p>
                    </div>
                  </div>
                  <Badge variant="accent" className="text-xs">{pr.division}</Badge>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Ejercicio</span>
                    <Badge variant="accent" className="text-xs">PR</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{pr.weight}</span>
                    <span className="text-gray-400">× {pr.reps} rep</span>
                  </div>
                  <div className="text-sm text-gray-500">{pr.exercise}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                  <span className="text-sm text-gray-500">{pr.time}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                      <Heart className="h-4 w-4 mr-1" />
                      Apoyar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-amber-400">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}