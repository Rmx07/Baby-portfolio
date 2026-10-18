import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "New keeper · Starloom Dream Dispatch" };

export default function RegisterPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed">
          ★ STARLOOM DREAM DISPATCH · NEW KEEPER ★
        </p>
        <Link href="/" className="btn btn-sm btn-cyan">🌙 Public site</Link>
      </div>
      <AuthForm mode="register" />
    </main>
  );
}
