import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center justify-center px-5 py-24">
      <SignIn />
    </main>
  );
}
