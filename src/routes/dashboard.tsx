import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, User as UserIcon, Settings, LogOut, Loader2, CheckCircle2, Clock, XCircle, Upload, Save, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES } from "@/lib/providers";
import { updateBookingStatus } from "@/lib/bookings.functions";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | Nuva" },
      { name: "description", content: "Manage your bookings and provider profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Tab = "bookings" | "provider" | "account";

interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  verification_status: "pending" | "approved" | "rejected";
  review_notes: string | null;
}
interface Booking {
  id: string;
  service: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_cents: number;
  status: string;
  created_at: string;
}
interface CustomExtra {
  id: string;
  name: string;
  price: number;
  description: string;
}
interface ProviderRow {
  id: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  country_code: string;
  country_name: string;
  flag: string | null;
  category: "woman" | "trans-woman";
  rate_per_hour: number;
  photo_path: string | null;
  is_published: boolean;
  details_included: string | null;
  details_excluded: string | null;
  special_notes: string | null;
  custom_extras: CustomExtra[] | null;
}

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("bookings");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incoming, setIncoming] = useState<Booking[]>([]);
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const approved = profile?.verification_status === "approved";

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);
    const [{ data: p }, { data: b }, { data: pr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("bookings").select("*").eq("client_user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("providers").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setBookings((b ?? []) as Booking[]);
    setProvider(pr as ProviderRow | null);
    if (pr?.id) {
      const { data: inc } = await supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", pr.id)
        .order("created_at", { ascending: false });
      setIncoming((inc ?? []) as Booking[]);
    } else {
      setIncoming([]);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadData();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-32 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</h1>
          <p className="mt-2 text-muted-foreground">Manage your bookings, provider profile, and account.</p>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:shadow-soft">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {profile && <VerificationBanner status={profile.verification_status} notes={profile.review_notes} />}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {([
          { id: "bookings", label: "Bookings", icon: CalendarDays },
          { id: "provider", label: "Provider profile", icon: UserIcon },
          { id: "account", label: "Account", icon: Settings },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {dataLoading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        ) : tab === "bookings" ? (
          <>
            {provider && (
              <IncomingBookings
                bookings={incoming}
                approved={approved}
                onChanged={loadData}
              />
            )}
            <div className={provider ? "mt-10" : ""}>
              <h2 className="mb-4 text-lg font-semibold">Your bookings</h2>
              <BookingsList bookings={bookings} />
            </div>
          </>
        ) : tab === "provider" ? (
          <ProviderEditor
            userId={user.id}
            displayName={profile?.display_name ?? ""}
            initial={provider}
            approved={approved}

            onSaved={(row) => setProvider(row)}
          />
        ) : (
          <AccountPanel profile={profile} email={user.email ?? ""} />

        )}
      </div>
    </div>
  );
}

function VerificationBanner({ status, notes }: { status: Profile["verification_status"]; notes: string | null }) {
  const config = {
    pending: { icon: Clock, cls: "bg-gold-soft text-gold-foreground", title: "Account pending review", body: "An admin is reviewing your ID document. You'll be notified within 24–48 hours." },
    approved: { icon: CheckCircle2, cls: "bg-green-500/10 text-green-700 dark:text-green-400", title: "Verified", body: "Your ID has been approved. You can publish a provider profile and receive bookings." },
    rejected: { icon: XCircle, cls: "bg-destructive/10 text-destructive", title: "Verification rejected", body: notes ?? "Please contact support to resubmit your documents." },
  }[status];
  const Icon = config.icon;
  return (
    <div className={`mt-6 flex items-start gap-3 rounded-3xl px-5 py-4 ${config.cls}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">{config.title}</p>
        <p className="text-sm opacity-90">{config.body}</p>
      </div>
    </div>
  );
}

function IncomingBookings({
  bookings,
  approved,
  onChanged,
}: {
  bookings: Booking[];
  approved: boolean;
  onChanged: () => void | Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const pending = bookings.filter((b) => b.status === "pending");

  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    setErr(null);
    setBusyId(id);
    try {
      await updateBookingStatus({ data: { bookingId: id, status } });
      await onChanged();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not update booking.";
      setErr(msg);
    } finally {
      setBusyId(null);
    }
  }


  return (
    <section aria-labelledby="incoming-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="incoming-heading" className="text-lg font-semibold">Incoming bookings</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            approved
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-gold-soft text-gold-foreground"
          }`}
          data-testid="provider-verification-status"
        >
          {approved ? (
            <><CheckCircle2 className="h-3.5 w-3.5" /> ID verified</>
          ) : (
            <><Clock className="h-3.5 w-3.5" /> ID pending — cannot accept bookings</>
          )}
        </span>
      </div>

      {!approved && (
        <div
          role="alert"
          className="mb-4 rounded-3xl border border-gold/40 bg-gold-soft px-5 py-4 text-sm text-gold-foreground"
        >
          <p className="font-semibold">Booking acceptance is disabled</p>
          <p className="mt-1 opacity-90">
            You cannot accept or decline bookings until an admin approves your identity
            document. Your clients will see incoming bookings as pending in the meantime.
          </p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No incoming bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
            >
              <div>
                <p className="font-semibold">{b.service}</p>
                <p className="text-sm text-muted-foreground">
                  {b.booking_date} at {b.booking_time} · {b.duration_hours}h
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  status: {b.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="mr-2 font-bold">${(b.total_cents / 100).toFixed(0)}</p>
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      disabled={!approved || busyId === b.id}
                      title={approved ? "Accept booking" : "ID must be approved before you can accept bookings"}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === b.id ? "…" : "Accept"}
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancelled")}
                      disabled={!approved || busyId === b.id}
                      title={approved ? "Decline booking" : "ID must be approved before you can decline bookings"}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {err && (
        <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>
      )}
      {pending.length > 0 && !approved && (
        <p className="mt-3 text-xs text-muted-foreground">
          {pending.length} pending request{pending.length === 1 ? "" : "s"} waiting on your verification.
        </p>
      )}
    </section>
  );
}

function BookingsList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center">
        <p className="text-muted-foreground">No bookings yet.</p>
        <Link to="/browse" search={{ country: "", category: "all" }} className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Browse providers
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <div key={b.id} className="flex items-center justify-between rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div>
            <p className="font-semibold">{b.service}</p>
            <p className="text-sm text-muted-foreground">{b.booking_date} at {b.booking_time} · {b.duration_hours}h</p>
          </div>
          <div className="text-right">
            <p className="font-bold">${(b.total_cents / 100).toFixed(0)}</p>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{b.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProviderEditor({
  userId, displayName, initial, approved, onSaved,
}: { userId: string; displayName: string; initial: ProviderRow | null; approved: boolean; onSaved: (row: ProviderRow) => void }) {
  const [name, setName] = useState(initial?.name ?? displayName);
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [country, setCountry] = useState(initial?.country_code ?? "US");
  const [category, setCategory] = useState<"woman" | "trans-woman">(initial?.category ?? "woman");
  const [rate, setRate] = useState(initial?.rate_per_hour ?? 150);
  const [published, setPublished] = useState(initial?.is_published ?? false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!initial?.photo_path) { setPhotoUrl(null); return; }
    supabase.storage.from("provider-photos").createSignedUrl(initial.photo_path, 3600).then(({ data }) => {
      setPhotoUrl(data?.signedUrl ?? null);
    });
  }, [initial?.photo_path]);

  const selectedCountry = useMemo(() => COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0], [country]);

  async function save() {
    setMsg(null);
    setSaving(true);
    let photo_path = initial?.photo_path ?? null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("provider-photos").upload(path, photoFile, { contentType: photoFile.type, upsert: false });
      if (error) { setSaving(false); return setMsg({ ok: false, text: "Photo upload failed: " + error.message }); }
      photo_path = path;
    }
    const payload = {
      user_id: userId,
      name, tagline, bio, location,
      country_code: selectedCountry.code,
      country_name: selectedCountry.name,
      flag: selectedCountry.flag,
      category,
      rate_per_hour: rate,
      photo_path,
      is_published: published && approved,
    };
    const { data, error } = await supabase.from("providers").upsert(payload, { onConflict: "user_id" }).select().single();
    setSaving(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Profile saved." });
    onSaved(data as ProviderRow);
  }

  return (
    <>
    <PayoutStatusCard approved={approved} />
    <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">

      <div>
        <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-secondary">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo yet</div>
          )}
        </div>
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-border py-3 text-sm font-medium hover:border-gold">
          <Upload className="h-4 w-4" /> {photoFile ? photoFile.name.slice(0, 24) : "Upload photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <div className="space-y-4">
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <Field label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short one-liner" className={inputCls} /></Field>
        <Field label="Bio"><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputCls} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City / neighborhood"><input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} /></Field>
          <Field label="Country">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as "woman" | "trans-woman")} className={inputCls}>
              <option value="woman">Woman</option>
              <option value="trans-woman">Trans Woman</option>
            </select>
          </Field>
          <Field label="Rate per hour (USD)"><input type="number" min={20} value={rate} onChange={(e) => setRate(Number(e.target.value))} className={inputCls} /></Field>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} disabled={!approved} className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium">Publish my profile</span>
            <span className="ml-2 text-muted-foreground">{approved ? "— visible in browse results" : "— available once account is approved"}</span>
          </span>
        </label>
        {msg && <div className={`rounded-2xl px-4 py-3 text-sm ${msg.ok ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>{msg.text}</div>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save profile
        </button>
      </div>
    </div>
    </>
  );
}

function PayoutStatusCard({ approved }: { approved: boolean }) {
  if (approved) {
    return (
      <div
        role="status"
        data-testid="payout-status"
        data-payout-enabled="true"
        className="flex items-start gap-3 rounded-3xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-700 dark:text-green-400"
      >
        <Wallet className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Payouts enabled</p>
          <p className="text-sm opacity-90">
            Your identity is verified. Stripe payouts will be released on your normal schedule
            after each completed booking.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      role="alert"
      data-testid="payout-status"
      data-payout-enabled="false"
      className="flex items-start gap-3 rounded-3xl border border-gold/40 bg-gold-soft px-5 py-4 text-gold-foreground"
    >
      <Wallet className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Payouts on hold — ID verification pending</p>
        <p className="mt-1 text-sm opacity-90">
          Stripe payouts are disabled on your account until Nuva approves your government-issued
          ID. Any bookings completed in the meantime will be held and released automatically once
          your verification is approved. This is a legal requirement — not a manual step you can
          skip.
        </p>
      </div>
    </div>
  );
}


function AccountPanel({ profile, email }: { profile: Profile | null; email: string }) {
  return (
    <div className="max-w-lg space-y-4 rounded-3xl border border-border bg-card p-6">
      <Row label="Email" value={email} />
      <Row label="Display name" value={profile?.display_name ?? "—"} />
      <Row label="Verification status" value={profile?.verification_status ?? "—"} />
      <p className="text-xs text-muted-foreground">To update your ID document, contact support.</p>
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-2">{children}</div></label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-border py-2 last:border-b-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}
