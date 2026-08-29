'use client';

import { SignIn } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Ranked Fitness</CardTitle>
          <CardDescription className="text-muted-foreground">
            Inicia sesión para continuar
          </CardDescription>
        </CardHeader>
        <CardContent suppressHydrationWarning>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </CardContent>
      </Card>
    </div>
  );
}