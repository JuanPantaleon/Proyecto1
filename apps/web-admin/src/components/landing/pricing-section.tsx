'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Jugador Base',
    price: 'Gratis',
    period: '',
    description: 'Para empezar tu viaje en el ranking',
    features: [
      'Registro ilimitado de entrenamientos',
      'Score ISG básico',
      'Ranking global y divisiones',
      'Rachas y misiones básicas',
      'Feed social (solo lectura)',
      { text: 'Publicidad no intrusiva', included: false },
      { text: 'Métricas avanzadas', included: false },
      { text: 'Coaches verificados', included: false },
    ],
    cta: 'Empezar Gratis',
    variant: 'outline',
    popular: false,
  },
  {
    name: 'Jugador Pro',
    price: '$9.99',
    period: '/mes',
    description: 'Para atletas serios que quieren maximizar su progreso',
    features: [
      'Todo lo de Base',
      'Sin publicidad',
      'Métricas avanzadas (velocidad, potencia, fatiga)',
      'Historial ilimitado y exportación CSV',
      'Análisis de debilidades por IA',
      'Detección automática de PRs prioritaria',
      'Misiones semanales personalizadas',
      'Estadísticas de clanes avanzadas',
      { text: 'Marketplace Coaches (descuento 20%)', included: false },
    ],
    cta: 'Suscribirse',
    variant: 'default',
    popular: true,
  },
  {
    name: 'Entrenador Verificado',
    price: '$29.99',
    period: '/mes',
    description: 'Para coaches que quieren profesionalizar su práctica',
    features: [
      'Todo lo de Pro',
      'Perfil en Marketplace con escudo dorado',
      'Capacidad de avalar evidencias (anti-trampas)',
      'Gestión ilimitada de alumnos',
      'Creación de rutinas con IA asistida',
      'Analytics de progreso de alumnos',
      'Comisión 0% en rutinas vendidas',
      'Badge "Entrenador Verificado" en perfil',
      'Soporte prioritario 24/7',
    ],
    cta: 'Solicitar Verificación',
    variant: 'accent',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
            PLANES DE SUSCRIPCIÓN
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Elige tu <span className="text-red-400">Nivel</span>. Sin Sorpresas.
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Planes transparentes. Cancela cuando quieras. La versión Base siempre será gratuita.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={cn(
                'relative group p-8 rounded-3xl transition-all duration-500 flex flex-col',
                'bg-gradient-to-br from-gray-900/80 to-gray-950/60',
                'backdrop-blur-xl',
                plan.variant === 'default' 
                  ? 'border-2 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]'
                  : plan.variant === 'accent'
                    ? 'border-2 border-amber-400/30 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
                    : 'border border-gray-800/50',
                plan.popular && 'ring-2 ring-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.15)]'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-red-500/20 border-red-500/30 text-red-400">
                    MÁS POPULAR
                  </Badge>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {typeof feature === 'string' ? (
                      <>
                        <Check className="h-5 w-5 text-green-400" />
                        <span className="text-gray-300">{feature}</span>
                      </>
                    ) : (
                      <>
                        <span className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-500 line-through">{feature.text}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.variant === 'default' ? 'default' : plan.variant === 'accent' ? 'accent' : 'outline'}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}