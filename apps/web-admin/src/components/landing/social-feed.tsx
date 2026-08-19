'use client';

import { Heart, MessageSquare, Dumbbell, Trophy, Medal, TrendingUp } from 'lucide-react';
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

const testimonials = [
  { name: 'Miguel R.', rank: '#3 Global', score: 94.7, badge: 'Diamante', quote: '"El Score ISG cambió cómo entreno. Ya no adivino, sé exactamente dónde estoy."' },
  { name: 'Ana K.', rank: '#12 Global', score: 91.2, badge: 'Platino', quote: '"Los coaches verificados me corrigieron la técnica. Mi PR de peso muerto subió 40kg."' },
  { name: 'Diego M.', rank: '#28 Global', score: 88.9, badge: 'Oro', quote: '"Las misiones semanales me mantienen constante. 200 días de racha y contando."' },
];

export function SocialFeed() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
            FEED SOCIAL Y TESTIMONIOS
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            La Comunidad que <span className="text-red-400">Impulsa</span> tu Progreso
          </h2>
        </div>

        <div className="lg:grid lg:grid-cols-2 gap-8">
          {/* Feed Social */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-red-400" />
              Feed Social Verificado
            </h3>
            <div className="space-y-4">
              {recentPRs.map((pr, i) => (
                <Card key={i} className={cn(
                  'p-5 transition-all duration-300',
                  'bg-gray-900/50 border border-gray-800/50',
                  'hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                        <span className="text-red-300 font-bold text-sm">{pr.user.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{pr.user}</p>
                        <p className="text-xs text-gray-500">#{pr.rank.replace('#', '')} {pr.division}</p>
                      </div>
                    </div>
                    <Badge variant="accent" className="text-xs">{pr.division}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{pr.exercise}</p>
                        <p className="text-sm text-gray-500">{pr.weight} × {pr.reps}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-amber-400 font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>{pr.weight}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between text-sm text-gray-500">
                    <span>{pr.time}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>Apoyar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-amber-400">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Medal className="h-6 w-6 text-amber-400" />
              Atletas Verificados
            </h3>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <Card key={i} className={cn(
                  'p-6 transition-all duration-300',
                  'bg-gray-900/50 border border-gray-800/50',
                  'hover:border-amber-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]'
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
                        <span className="text-amber-300 font-bold text-sm">{t.name.split(' ').map(n => n[0]).join('.')}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={t.badge === 'Diamante' ? 'accentSolid' : t.badge === 'Platino' ? 'primarySolid' : 'accent'} className="text-xs">
                            {t.badge}
                          </Badge>
                          <span className="text-amber-400 font-bold">{t.rank}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <span className="font-bold">{t.score}</span>
                      <span className="text-gray-500 text-sm">ISG</span>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Medal className="h-3 w-3" />
                      {t.badge}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Score: {t.score}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}