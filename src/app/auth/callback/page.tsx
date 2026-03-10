"use client";

import { useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Exchange the backend JWT for a NextAuth Session automatically
      signIn("credentials", {
        token,
        redirect: false,
      }).then((response) => {
        if (response?.ok) {
          // Check for a stored redirect path
          const savedPath = sessionStorage.getItem("authRedirect");
          if (savedPath) {
            sessionStorage.removeItem("authRedirect");
            router.push(savedPath);
          } else {
            router.push("/discover");
          }
        } else {
          router.push("/?error=auth-failed");
        }
      });
    } else {
      router.push("/?error=missing-token");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
