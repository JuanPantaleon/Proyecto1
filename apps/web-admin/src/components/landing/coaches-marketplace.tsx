'use client';

import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const coaches = [
  { name: 'Carlos Méndez', specialty: 'Powerlifting', verified: true, avatar: 'CM', score: 98.5, athletes: 247, successRate: 98 },
  { name: 'Laura Sánchez', specialty: 'Hipertrofia', verified: true, avatar: 'LS', score: 97.2, athletes: 189, successRate: 96 },
  { name: 'Roberto Kim', specialty: 'Strongman', verified: true, avatar: 'RK', score: 99.1, athletes: 156, successRate: 99 },
];

function CoachCard({ coach }: { coach: typeof coaches[0] }) {
  return (
    <Card className="relative group p-8 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col bg-gradient-to-br from-gray-900/80 to-gray-950/60 backdrop-blur-xl border border-gray-800/50 hover:border-amber-400/30 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] hover:scale-[1.01]">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-400">{coach.avatar}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{coach.name}</h3>
              <p className="text-gray-400">{coach.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 rounded-xl">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Verificado</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-amber-400">{coach.score}</div>
            <div className="text-xs text-gray-500">Score ISG Promedio</div>
          </div>
          <div className="w-px h-10 bg-gray-800 mx-4" />
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-red-400">{coach.athletes}</div>
            <div className="text-xs text-gray-500">Atletas Entrenados</div>
          </div>
          <div className="w-px h-10 bg-gray-800 mx-4" />
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-green-400">{coach.successRate}%</div>
            <div className="text-xs text-gray-500">Tasa Éxito PRs</div>
          </div>
        </div>

        <Button className="w-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] group mt-auto">
          Solicitar Rutina Personalizada
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}

export function CoachesMarketplace() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
            MARKETPLACE DE ENTRENADORES
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Entrena con los Mejores. <span className="text-amber-400">Valida tus Marcas.</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Entrenadores verificados institucionalmente. Cada uno ha pasado auditoría de credenciales, historial de atletas y metodología comprobada.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <CoachCard key={coach.name} coach={coach} />
          ))}
        </div>
      </div>
    </section>
  );
}