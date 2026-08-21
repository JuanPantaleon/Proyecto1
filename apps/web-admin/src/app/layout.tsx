import './global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/lib/providers';
import { Toaster } from '@/components/ui/toaster';
import { ClerkTokenSync } from '@/components/auth/clerk-token-sync';

export const metadata = {
  title: 'Ranked Fitness Admin',
  description: 'Panel de administración de Ranked Fitness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
  signInUrl="/sign-in"
  signUpUrl="/sign-up"
>
      <html lang="es" className="h-full dark" suppressHydrationWarning>
        <body className="h-full bg-background text-foreground" suppressHydrationWarning>
          <Providers>
            <ClerkTokenSync />
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}