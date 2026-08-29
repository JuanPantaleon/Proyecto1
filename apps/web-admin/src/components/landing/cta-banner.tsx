'use client';

import { Flame, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaBanner() {
  return (
    <section className="relative py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-8 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.08%22/%3E%3C/svg%3E')]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
          
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="h-8 w-8 animate-pulse" />
              <span className="text-2xl font-bold">MANTÉN TU RACHA</span>
              <Flame className="h-8 w-8 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Multiplica tu <span className="text-amber-300">Score</span>, Domina la División
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-xl mx-auto">
              Cada set cuenta. Cada sesión te acerca a la cima. La constancia es la única variable que controlas totalmente.
            </p>
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-900 text-white gap-3 group px-10 py-4 text-lg"
              onClick={() => window.location.href = '/sign-up'}
            >
              Registrar Entrenamiento
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-amber-300/50 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${10 + Math.random() * 10}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}