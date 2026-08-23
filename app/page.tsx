import { getLeaderboard } from "@/lib/elo";
import SubmitScore from "./submit-score";
import { useUser } from "@clerk/nextjs";

type AppUser = { firstName?: string; username?: string; id?: string };

export default async function Home() {
  const { user, isLoaded } = useUser();
  let userData: AppUser | null = null;

  if (isLoaded) {
    userData = user ? {
      firstName: user.firstName ?? "",
      username: user.username ?? "",
      id: user.id ?? ""
    } : null;
  }

  const leaderboard = await getLeaderboard(10);

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 max-w-2xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
          Ranked Fitness
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          La comunidad de entrenamiento más grande
        </p>
      </header>

      {userData && (
        <div className="mb-8 md:mb-12">
          <p className="text-base md:text-lg">Hola, {userData.firstName ?? userData.username}</p>
          <a href="/neurodas" className="mt-3 inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200">
            Ver Panel Neurodas
          </a>
        </div>
      )}

      {!userData && !isLoaded && (
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-base md:text-lg text-muted-foreground">Cargando sesión...</p>
        </div>
      )}

      {!userData && isLoaded && (
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-base md:text-lg text-muted-foreground">
            Inicia sesión para aparecer en el ranking
          </p>
        </div>
      )}

      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">Top 10</h2>
        <ol className="space-y-4">
          {leaderboard.map((entry) => (
            <li key={entry.userId} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">
                  {entry.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{entry.name}</p>
                <p className="text-sm text-muted-foreground">{entry.name}</p>
              </div>
              <span className="text-2xl font-bold text-primary">{entry.rating}</span>
            </li>
          ))}
        </ol>
      </section>

      <SubmitScore />
    </main>
  );
}