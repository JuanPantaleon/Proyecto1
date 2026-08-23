// use client

export default function OnboardingPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a Ranked Fitness!</h1>
      <p className="text-muted-opacity mb-4">
        Complete tu perfil para comenzar a seguir tus entrenamientos.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/neurodas"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-2"
        >
          Ir al Panel
        </a>
      </div>
    </div>
  );
}