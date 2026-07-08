import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log In or Sign Up | Nuva" },
      { name: "description", content: "Access your Nuva account — book premium housekeeping or manage your provider profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

interface AuthValues {
  email: string;
  password: string;
  name?: string;
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Reveal>
        <div className="rounded-4xl border border-border bg-card p-8 shadow-lift sm:p-10">
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setSubmitted(false); }}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
                  mode === m ? "bg-card shadow-soft" : "text-muted-foreground"
                }`}
                aria-pressed={mode === m}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="mt-8 text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Log in to manage bookings and messages."
              : "Join Nuva as a client or professional. 18+ only — identity verification required."}
          </p>

          {submitted ? (
            <div className="mt-8 rounded-3xl bg-gold-soft p-6 text-center text-sm text-gold-foreground">
              Accounts go live once secure login is connected — this is a preview of the experience.
            </div>
          ) : (
            <form onSubmit={handleSubmit(() => setSubmitted(true))} className="mt-8 space-y-4" noValidate>
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Full name</label>
                  <input
                    id="name"
                    {...register("name", { required: mode === "register" ? "Please enter your name" : false })}
                    className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
              )}
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                  })}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-xs text-muted-foreground underline underline-offset-2">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Please enter a password",
                    minLength: { value: 8, message: "At least 8 characters" },
                  })}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift"
              >
                {mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center justify-center gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-gold" /> Encrypted</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> ID verified community</span>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
          <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </Reveal>
    </div>
  );
}
