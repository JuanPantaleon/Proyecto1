import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="p-4 md:p-6 min-h-screen bg-background">
      <div className="flex flex-col items-center md:items-start justify-center w-full md:w-80">
        <SignUp />
      </div>
    </main>
  );
}