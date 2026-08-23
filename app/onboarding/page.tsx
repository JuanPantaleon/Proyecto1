// use client

export default function OnboardingPage() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8">Bienvenido a Ranked Fitness!</h1>
      <p className="text-base md:text-lg text-muted-opacity mb-4 md:mb-8">
        Complete tu perfil para comenzar a seguir tus entrenamientos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <a
          href="/neurodas"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-1 md:col-span-2 w-full md:w-auto"
        >
          Ir al Panel
        </a>
      </div>
    </div>
  );
}