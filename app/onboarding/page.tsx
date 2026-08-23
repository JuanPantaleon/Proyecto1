// use client

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-2xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Bienvenido a Ranked Fitness
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
          La plataforma definitiva para seguir y comparar tus entrenamientos
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Complete tu perfil para comenzar a seguir tus entrenamientos y ver
            cómo te comparas con la comunidad.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/neurodas"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200"
          >
            Ir al Panel
          </a>
          <div className="px-6 py-4 bg-card rounded-xl border border-border">
            <p className="text-sm text-muted-foreground">
              Tu progreso se guardará automáticamente a medida que completes
              cada sección.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}