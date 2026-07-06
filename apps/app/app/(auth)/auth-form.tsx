"use client";

import { signIn, signUp } from "@repo/auth/client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  callbackUrl?: string;
  mode: AuthMode;
}

const copy = {
  "sign-in": {
    title: "Sign in",
    description: "Use your email and password to open the authenticated app.",
    submit: "Sign in",
    switchLabel: "Need an account?",
    switchHref: "/sign-up",
    switchText: "Create one",
  },
  "sign-up": {
    title: "Create account",
    description: "Create the first account for this SaaS starter.",
    submit: "Create account",
    switchLabel: "Already have an account?",
    switchHref: "/sign-in",
    switchText: "Sign in",
  },
} satisfies Record<AuthMode, Record<string, string>>;

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Authentication failed. Check your details and try again.";
};

export const AuthForm = ({ mode, callbackUrl = "/dashboard" }: AuthFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const text = copy[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    try {
      const response =
        mode === "sign-up"
          ? await signUp.email({ email, password, name, callbackURL: callbackUrl })
          : await signIn.email({ email, password, callbackURL: callbackUrl });

      if (response.error) {
        setError(getErrorMessage(response.error));
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" ? <Input autoComplete="name" name="name" placeholder="Full name" required /> : null}
          <Input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          <Input
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            minLength={8}
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? "Please wait..." : text.submit}
          </Button>
          <p className="text-center text-muted-foreground text-sm">
            {text.switchLabel}{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href={`${text.switchHref}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              {text.switchText}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
