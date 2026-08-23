import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SignUp
        afterSignUpUrl="/onboarding"
        className="w-full max-w-md p-8"
      />
    </div>
  );
}