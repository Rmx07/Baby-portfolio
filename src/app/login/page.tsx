import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Keeper sign-in · Starloom Dream Dispatch" };

export default function LoginPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-pixel)] text-[0.55rem] leading-relaxed">
          ★ STARLOOM DREAM DISPATCH · KEEPER DOOR ★
        </p>
        <Link href="/" className="btn btn-sm btn-cyan">🌙 Public site</Link>
      </div>
      <AuthForm mode="login" />
    </main>
  );
}
