import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Inicia sesión
        </h2>
        <div className="space-y-4">
          <div className="w-full bg-background border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <SignIn
              routing="path"
              signUpUrl="/sign-up"
              signInUrl="/sign-in"
              afterSignInUrl="/onboarding"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          ¿No tienes cuenta? <a href="/sign-up" className="underline underline-offset-3 hover:text-primary">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}