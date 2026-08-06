import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ExternalLink, History as HistoryIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Verification Review | Nuva" },
      { name: "description", content: "Nuva admin tools for reviewing provider identity and age verification submissions." },
      { property: "og:title", content: "Admin Verification Review | Nuva" },
      { property: "og:description", content: "Review and approve pending provider verifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface VerificationRow {
  id: string;
  user_id: string;
  document_type: string;
  document_path: string;
  selfie_path: string | null;
  date_of_birth: string | null;
  selfie_date: string | null;
  status: string;
  created_at: string;
}

interface ProfileLite {
  id: string;
  display_name: string | null;
  email: string | null;
  verification_status: string;
}

interface AuditRow {
  id: string;
  user_id: string;
  admin_id: string;
  action: string;
  reason: string | null;
  created_at: string;
}

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [audit, setAudit] = useState<Record<string, AuditRow[]>>({});
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    const admin = (roles ?? []).length > 0;
    setIsAdmin(admin);
    if (!admin) {
      setDataLoading(false);
      return;
    }

    const { data: v } = await supabase
      .from("id_verifications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const list = (v ?? []) as VerificationRow[];
    setRows(list);

    if (list.length) {
      const userIds = list.map((r) => r.user_id);
      const { data: p } = await supabase
        .from("profiles")
        .select("id, display_name, email, verification_status")
        .in("id", userIds);
      const map: Record<string, ProfileLite> = {};
      for (const row of (p ?? []) as ProfileLite[]) map[row.id] = row;
      setProfiles(map);

      const { data: a } = await supabase
        .from("verification_audit_log")
        .select("id, user_id, admin_id, action, reason, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false });
      const auditMap: Record<string, AuditRow[]> = {};
      for (const row of (a ?? []) as AuditRow[]) {
        (auditMap[row.user_id] ??= []).push(row);
      }
      setAudit(auditMap);

      const adminIds = [...new Set((a ?? []).map((r) => (r as AuditRow).admin_id))];
      if (adminIds.length) {
        const { data: ap } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .in("id", adminIds);
        const names: Record<string, string> = {};
        for (const row of ap ?? []) names[row.id] = row.display_name ?? row.email ?? row.id;
        setAdminNames(names);
      }
    }
    setDataLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  async function openFile(path: string) {
    const { data, error } = await supabase.storage.from("id-documents").createSignedUrl(path, 300);
    if (error || !data) return setErr("Could not open document.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function decide(row: VerificationRow, status: "approved" | "rejected", notes?: string) {
    if (!user) return;
    setErr(null);
    setBusyId(row.id);
    const now = new Date().toISOString();
    const { error: e1 } = await supabase
      .from("id_verifications")
      .update({ status, reviewed_by: user.id, reviewed_at: now, review_notes: notes ?? null })
      .eq("id", row.id);
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ verification_status: status, reviewed_by: user.id, reviewed_at: now, review_notes: notes ?? null })
      .eq("id", row.user_id);
    const { error: e3 } = await supabase.from("verification_audit_log").insert({
      verification_id: row.id,
      user_id: row.user_id,
      admin_id: user.id,
      action: status,
      reason: notes ?? null,
    });
    setBusyId(null);
    if (e1 || e2 || e3) return setErr(e1?.message ?? e2?.message ?? e3?.message ?? "Update failed.");
    setRejectingId(null);
    setReason("");
    await load();
  }


  if (loading || !user || (dataLoading && isAdmin === null)) {
    return <div className="mx-auto max-w-lg px-4 py-32 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">This area is restricted to Nuva administrators.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-gold" />
        <h1 className="text-3xl font-bold sm:text-4xl">Verification review</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Approve or reject pending provider identity &amp; age submissions. Providers cannot receive
        bookings until approved.
      </p>

      {err && <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{err}</p>}

      <div className="mt-8 space-y-4">
        {dataLoading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        ) : rows.length === 0 ? (
          <p className="rounded-3xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            No pending verifications.
          </p>
        ) : (
          rows.map((row) => {
            const p = profiles[row.user_id];
            return (
              <div key={row.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p?.display_name ?? "Unnamed user"}</p>
                    <p className="text-sm text-muted-foreground">{p?.email ?? row.user_id}</p>
                    <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                      <div><dt className="inline text-muted-foreground">Date of birth: </dt><dd className="inline font-medium">{row.date_of_birth ?? "—"}</dd></div>
                      <div><dt className="inline text-muted-foreground">Document: </dt><dd className="inline font-medium">{row.document_type.replace(/_/g, " ")}</dd></div>
                      <div><dt className="inline text-muted-foreground">Selfie date: </dt><dd className="inline font-medium">{row.selfie_date ?? "—"}</dd></div>
                      <div><dt className="inline text-muted-foreground">Submitted: </dt><dd className="inline font-medium">{new Date(row.created_at).toLocaleDateString()}</dd></div>
                    </dl>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openFile(row.document_path)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:shadow-soft">
                      <ExternalLink className="h-3.5 w-3.5" /> ID
                    </button>
                    {row.selfie_path && (
                      <button onClick={() => openFile(row.selfie_path!)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:shadow-soft">
                        <ExternalLink className="h-3.5 w-3.5" /> Selfie
                      </button>
                    )}
                  </div>
                </div>

                {(audit[row.user_id]?.length ?? 0) > 0 && (
                  <div className="mt-5 rounded-2xl bg-muted/40 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <History className="h-3.5 w-3.5" /> Review history
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {audit[row.user_id]!.map((a) => (
                        <li key={a.id} className="text-sm">
                          <span className={a.action === "approved" ? "font-semibold text-primary" : "font-semibold text-destructive"}>
                            {a.action === "approved" ? "Approved" : "Rejected"}
                          </span>{" "}
                          by {adminNames[a.admin_id] ?? a.admin_id} on {new Date(a.created_at).toLocaleString()}
                          {a.reason ? <span className="text-muted-foreground"> — {a.reason}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 border-t border-border pt-4">
                  {rejectingId === row.id ? (
                    <div className="space-y-3">
                      <label htmlFor={`reason-${row.id}`} className="text-sm font-medium">
                        Rejection reason (shared with the provider)
                      </label>
                      <textarea
                        id={`reason-${row.id}`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="e.g. The selfie does not show today's date clearly."
                        className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => decide(row, "rejected", reason.trim())}
                          disabled={busyId === row.id || reason.trim().length < 5}
                          className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
                        >
                          {busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Confirm rejection
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setReason(""); }}
                          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => decide(row, "approved")}
                        disabled={busyId === row.id}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
                      >
                        {busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectingId(row.id); setReason(""); }}
                        disabled={busyId === row.id}
                        className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
