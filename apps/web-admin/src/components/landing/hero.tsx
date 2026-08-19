'use client';

import { Dumbbell, Sparkles, Play, ArrowRight, ShieldCheck, Users, Trophy, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <Badge variant="accent" className="mb-6 text-sm px-4 py-2 border-amber-400/50">
            <Sparkles className="h-3 w-3 mr-1" />
            Nueva versión 2.0 — Motor ISG 2.0
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">
              ELEVA TU NIVEL.
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              DOMINA EL RANKING.
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-xl">
            La única plataforma que cuantifica tu fuerza real, valida tus marcas sin trampas y te sitúa en un ranking global competitivo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="w-full sm:w-auto gap-2 group"
              onClick={() => window.location.href = '/sign-up'}
            >
              <Play className="h-5 w-5" />
              Inicia tu primer Set
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-gray-700 hover:border-red-500/50 hover:bg-red-500/5"
            >
              Ver Demo en Vivo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>100% Verificado</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-400" />
              <span>50,000+ Atletas</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>2M+ Sets Validados</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right: Mockup Phone/App Preview */}
        <div className="relative">
          <div className="relative">
            {/* Phone frame */}
            <div className="relative mx-auto max-w-xs">
              <div className="aspect-[9/19.5] bg-gray-950 rounded-[40px] border-4 border-gray-800 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_0_60px_-10px_rgba(239,68,68,0.15)] overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-black rounded-b-xl z-10" />
                
                {/* Screen content */}
                <div className="absolute inset-4 bg-black rounded-[32px] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 py-3 text-white text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">94.7</span>
                      <span className="text-xs font-bold">ISG</span>
                    </div>
                  </div>
                  
                  {/* PR Card */}
                  <div className="mx-4 mt-6 p-5 bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/30 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-amber-500/5" />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-full">
                        NUEVO RÉCORD
                      </span>
                    </div>
                    <div className="relative flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">PESO MUERTO</span>
                      <Badge variant="accent" className="text-xs">PR</Badge>
                    </div>
                    <div className="text-4xl font-bold text-white">280<span className="text-xl font-medium text-gray-400">kg</span></div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>1 rep • 98.7 ISG</span>
                      <span className="text-amber-400 font-bold">+12.3 vs anterior</span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-amber-400">
                      <span className="text-xs font-bold">División Diamante</span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Score ISG', value: '94.7', color: 'text-red-400' },
                      { label: 'Racha', value: '142 días', color: 'text-amber-400' },
                      { label: 'Ranking', value: '#47', color: 'text-gray-300' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 bg-gray-900/50 rounded-xl text-center">
                        <div className={`${stat.color} text-2xl font-bold`}>{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
                    <div className="flex items-center justify-around text-gray-500">
                      <button className="flex flex-col items-center gap-1 text-red-400">
                        <Flame className="h-6 w-6" />
                        <span className="text-xs">Timer</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <Dumbbell className="h-6 w-6" />
                        <span className="text-xs">Entrenar</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <Trophy className="h-6 w-6" />
                        <span className="text-xs">Ranking</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <Users className="h-6 w-6" />
                        <span className="text-xs">Social</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-transparent to-amber-500/20 rounded-[50px] blur-2xl opacity-50 animate-pulse" />
            </div>
          </div>
          
          {/* Floating badges around phone */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-bounce-subtle">
            <span className="text-black font-bold text-2xl">+12.3</span>
          </div>
          <div className="absolute -bottom-8 -left-6 w-24 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm">
            <Flame className="h-4 w-4 text-red-400" />
            <span className="text-red-300 text-sm font-bold">Racha: 142</span>
          </div>
        </div>
      </div>
    </section>
  );
}