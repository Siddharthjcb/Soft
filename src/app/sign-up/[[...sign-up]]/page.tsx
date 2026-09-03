import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center justify-center px-5 py-24">
      <SignUp />
    </main>
  );
}
