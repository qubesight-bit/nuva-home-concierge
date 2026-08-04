import { useEffect, useState } from "react";
import { IdCard, Loader2, Upload, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DOC_TYPES = [
  { id: "passport", label: "Passport" },
  { id: "drivers_license", label: "Driver's License" },
  { id: "national_id", label: "National ID" },
  { id: "residency_card", label: "Permanent Residency Card" },
] as const;

type DocType = (typeof DOC_TYPES)[number]["id"];

const MAX_BYTES = 10 * 1024 * 1024;

function isAdult(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff;
}

export function ManualVerifyCard({ userId, approved }: { userId: string; approved: boolean }) {
  const [dob, setDob] = useState("");
  const [docType, setDocType] = useState<DocType>("passport");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState<{ status: string } | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("id_verifications")
        .select("status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) setExisting(data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function upload(file: File, kind: string) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("id-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!isAdult(dob)) return setErr("You must be at least 18 years old to become a provider.");
    if (!idFile || !selfieFile) return setErr("Please upload both your government ID and your selfie.");
    if (idFile.size > MAX_BYTES || selfieFile.size > MAX_BYTES) return setErr("Each file must be under 10MB.");

    setBusy(true);
    try {
      const [documentPath, selfiePath] = await Promise.all([
        upload(idFile, "id"),
        upload(selfieFile, "selfie"),
      ]);

      const { error: insErr } = await supabase.from("id_verifications").insert({
        user_id: userId,
        document_type: docType,
        document_path: documentPath,
        selfie_path: selfiePath,
        date_of_birth: dob,
        selfie_date: today,
        status: "pending",
      });
      if (insErr) throw new Error(insErr.message);

      await supabase.from("profiles").update({ date_of_birth: dob }).eq("id", userId);
      setSubmitted(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not submit your documents.");
    } finally {
      setBusy(false);
    }
  }

  if (approved) return null;

  if (submitted || existing?.status === "pending") {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-3xl bg-gold-soft px-5 py-4 text-gold-foreground">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Documents submitted — pending verification</p>
          <p className="text-sm opacity-90">
            An admin is reviewing your date of birth, government ID and selfie. You cannot receive
            bookings until your status is set to verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <IdCard className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="font-semibold">Provider verification</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Required before you can receive bookings. Your documents are private and visible only to
            Nuva admins.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dob" className="text-sm font-medium">Date of birth</label>
                <input
                  id="dob" type="date" required value={dob} max={today}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label htmlFor="mv-doctype" className="text-sm font-medium">Document type</label>
                <select
                  id="mv-doctype" value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {DOC_TYPES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <FileField
              label="Government ID"
              hint="JPG, PNG or PDF · under 10MB"
              file={idFile}
              accept="image/*,application/pdf"
              onChange={setIdFile}
            />
            <FileField
              label={`Selfie holding today's date (${today})`}
              hint="Hold a paper with today's date next to your face · JPG or PNG"
              file={selfieFile}
              accept="image/*"
              onChange={setSelfieFile}
            />

            {err && (
              <p className="flex items-center gap-2 text-xs text-destructive" role="alert">
                <AlertTriangle className="h-3.5 w-3.5" /> {err}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit for verification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FileField({
  label, hint, file, accept, onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  accept: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-gold">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{file ? file.name : "Click to select a file"}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
        <input
          type="file" accept={accept} className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
