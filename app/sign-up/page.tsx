import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="w-full md:w-96 bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Crea tu cuenta
        </h2>
        <div className="space-y-4">
          <div className="w-full bg-background border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <SignUp />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          ¿Ya tienes cuenta? <a href="/sign-in" className="underline underline-offset-3 hover:text-primary">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}