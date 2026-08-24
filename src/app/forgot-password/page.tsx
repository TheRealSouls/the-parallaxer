import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";

export const metadata: Metadata = {
  // A sign-in form has nothing to offer a search result.
  robots: { index: false },
  title: "Forgotten password",
  description: "Request a link to set a new password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-16">
      <header className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-4xl font-semibold">Forgotten password</h1>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          Give us the address on your account and we will send a link to set a new password.
        </p>
      </header>
      <div className="mt-10">
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
