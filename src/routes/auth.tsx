import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { registerAccount } from "@/lib/auth-signup.functions";

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

const DOC_TYPES = [
  { id: "passport", label: "Passport" },
  { id: "drivers_license", label: "Driver's License" },
  { id: "national_id", label: "National ID" },
  { id: "residency_card", label: "Permanent Residency Card" },
] as const;

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [docType, setDocType] = useState<(typeof DOC_TYPES)[number]["id"]>("passport");
  const [file, setFile] = useState<File | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    if (!loading && user && !signupComplete) navigate({ to: "/dashboard" });
  }, [loading, user, navigate, signupComplete]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return setError(error.message);
    navigate({ to: "/dashboard" });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ageConfirmed) return setError("You must confirm you are at least 18 years old.");
    if (!file) return setError("Please upload a photo of your ID document.");
    if (file.size > 10 * 1024 * 1024) return setError("Document must be under 10MB.");
    setSubmitting(true);

    let userId: string;
    try {
      const result = await registerAccount({
        data: { email, password, displayName: name, ageConfirmed },
      });
      userId = result.userId;
    } catch (err) {
      setSubmitting(false);
      return setError(err instanceof Error ? err.message : "Sign up failed.");
    }

    // Sign the new user in so RLS-scoped uploads work under their folder.
    const { error: siError } = await supabase.auth.signInWithPassword({ email, password });
    if (siError) {
      setSubmitting(false);
      return setError("Account created but sign-in failed: " + siError.message);
    }


    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("id-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setSubmitting(false);
      return setError("Account created, but document upload failed: " + uploadError.message);
    }

    const { error: verifError } = await supabase.from("id_verifications").insert({
      user_id: userId,
      document_type: docType,
      document_path: path,
    });
    if (verifError) {
      setSubmitting(false);
      return setError("Uploaded, but couldn't record verification: " + verifError.message);
    }

    setSubmitting(false);
    setSignupComplete(true);
  }

  if (signupComplete) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <Reveal>
          <div className="rounded-4xl border border-border bg-card p-8 text-center shadow-lift sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
              <CheckCircle2 className="h-8 w-8 text-black" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Account created</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your ID document has been submitted for manual review. You'll receive an email
              once an admin approves your account. This usually takes 24–48 hours.
            </p>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="mt-8 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Go to dashboard
            </button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Reveal>
        <div className="rounded-4xl border border-border bg-card p-8 shadow-lift sm:p-10">
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
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
              ? "Log in to manage bookings and your profile."
              : "18+ only. Every account is manually reviewed after an ID upload."}
          </p>

          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="mt-8 space-y-4"
            noValidate
          >
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="text-sm font-medium">Full name</label>
                <input
                  id="name" required value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password" type="password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              {mode === "register" && (
                <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters. We check against known breached passwords.</p>
              )}
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label htmlFor="docType" className="text-sm font-medium">Document type</label>
                  <select
                    id="docType" value={docType}
                    onChange={(e) => setDocType(e.target.value as typeof docType)}
                    className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {DOC_TYPES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload ID (photo or scan)</label>
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-gold">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {file ? file.name : "Click to select a file"}
                    </span>
                    <span className="text-xs text-muted-foreground">JPG, PNG, or PDF · under 10MB</span>
                    <input
                      type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your ID is encrypted, visible only to Nuva admins for age & identity verification, and never shared with clients or providers.
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-input bg-background px-4 py-3">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                  />
                  <span className="text-xs text-muted-foreground">
                    I confirm that I am at least 18 years old. Providing false age
                    information may result in immediate account termination. See our{" "}
                    <Link to="/age-verification" className="underline underline-offset-2">
                      Age Verification Policy
                    </Link>.
                  </span>
                </label>
              </>
            )}

            {error && (
              <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (mode === "register" && !ageConfirmed)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

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
