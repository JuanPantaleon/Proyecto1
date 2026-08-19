'use client';

import { SignUp } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Ranked Fitness</CardTitle>
          <CardDescription className="text-muted-foreground">
            Crea tu cuenta para empezar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-none border-0 bg-transparent',
                formButtonPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow-primary-glow/20',
                formFieldInput: 'bg-input border-border focus:border-border-focus focus:ring-ring/20',
                formFieldLabel: 'text-foreground',
                formFieldError: 'text-destructive',
                socialButtonsBlockButton: 'bg-card border-border hover:bg-background-hover',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            // socialProviders={['google']} // Google OAuth deshabilitado - descomenta para activar
          />
        </CardContent>
      </Card>
    </div>
  );
}