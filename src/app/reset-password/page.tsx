import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/PasswordResetForms";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-16">
      <header className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-4xl font-semibold">Set a new password</h1>
      </header>
      <div className="mt-10">
        {/* useSearchParams reads the token, so it needs a boundary. */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
