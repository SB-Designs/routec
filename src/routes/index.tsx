import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { getTicket, type TicketResult } from "@/lib/ticket.functions";
import {
  AFTERNOON_STOPS,
  ALL_STOPS,
  MORNING_STOPS,
  estimate,
  haversineKm,
  type Stop,
} from "@/lib/route-c-stops";

const BusMap = lazy(() => import("@/components/BusMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Route C Live Bus Tracker — Enter Your Ticket" },
      {
        name: "description",
        content:
          "Track the Route C school bus in real time. Enter your ticket ID, pick your stop and see live distance and estimated arrival, updated every 10 seconds.",
      },
      { property: "og:title", content: "Route C Live Bus Tracker" },
      {
        property: "og:description",
        content:
          "Live Route C bus position, distance to your stop and estimated arrival time, refreshed every 10 seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const fetchTicket = useServerFn(getTicket);
  const [ticketInput, setTicketInput] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopId, setStopId] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (id: string) => {
      const res = await fetchTicket({ data: { ticketId: id } });
      setResult(res);
      setUpdatedAt(new Date());
      if (!res.ok && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
        setTicketId(null);
      }
    },
    [fetchTicket],
  );

  useEffect(() => {
    if (!ticketId) return;
    timer.current = setInterval(() => void load(ticketId), 10_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [ticketId, load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = ticketInput.trim();
    if (!id || loading) return;
    setLoading(true);
    const res = await fetchTicket({ data: { ticketId: id } });
    setResult(res);
    setUpdatedAt(new Date());
    setLoading(false);
    setTicketId(res.ok ? id : null);
  }

  const live = result?.ok ? result : null;
  const stop = ALL_STOPS.find((s) => s.id === stopId) ?? null;
  const distanceKm = live && stop ? haversineKm(live, stop) : null;
  const eta = distanceKm !== null ? estimate(distanceKm) : null;

  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto w-full max-w-2xl px-5 py-12">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
            Route C
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Live bus tracker
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your ticket ID to follow the Route C coach. Position refreshes every 10 seconds.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row"
          style={{ boxShadow: "var(--shadow-panel)" }}
        >
          <input
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="Your ticket ID"
            aria-label="Ticket ID"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Track bus"}
          </button>
        </form>

        {result && !result.ok && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {result.error}
          </p>
        )}

        {live && (
          <section className="mt-6 space-y-6">
            <div
              className="rounded-2xl border border-border bg-card p-5"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Service</p>
                  <p className="text-lg font-semibold text-foreground">{live.serviceName}</p>
                </div>
                <span className="flex items-center gap-2 text-xs text-accent">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  {live.enabled ? "Live" : "Offline"}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Latitude</dt>
                  <dd className="font-mono text-foreground">{live.lat.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Longitude</dt>
                  <dd className="font-mono text-foreground">{live.long.toFixed(6)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Last position update</dt>
                  <dd className="text-foreground">
                    {live.lastUpdated ? new Date(live.lastUpdated).toLocaleString("en-GB") : "—"}
                    {updatedAt && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (checked {updatedAt.toLocaleTimeString("en-GB")})
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <Suspense
              fallback={
                <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground sm:h-96">
                  Loading map…
                </div>
              }
            >
              <BusMap lat={live.lat} long={live.long} stop={stop} />
            </Suspense>
            <p className="text-xs text-muted-foreground">
              Green dot is the bus · amber diamond is your selected stop.
            </p>

            <div
              className="rounded-2xl border border-border bg-card p-5"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <label
                htmlFor="stop"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Your bus stop
              </label>
              <select
                id="stop"
                value={stopId}
                onChange={(e) => setStopId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a stop…</option>
                <optgroup label="Morning – Pick up">
                  {MORNING_STOPS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.time} · {s.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Afternoon – Drop off">
                  {AFTERNOON_STOPS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.time} · {s.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {stop && distanceKm !== null && eta && (
                <StopSummary stop={stop} roadKm={eta.roadKm} minutes={eta.minutes} />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StopSummary({
  stop,
  roadKm,
  minutes,
}: {
  stop: Stop;
  roadKm: number;
  minutes: number;
}) {
  const arrival = new Date(Date.now() + minutes * 60_000);
  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="text-base font-semibold text-foreground">{stop.name}</p>
      <p className="text-sm text-muted-foreground">
        Scheduled {stop.time}
        {stop.w3w && <> · ///{stop.w3w}</>}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Metric label="Distance" value={`${roadKm.toFixed(1)} km`} />
        <Metric label="ETA" value={`${minutes} min`} />
        <Metric label="Arriving" value={arrival.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Distance and arrival are estimates based on the bus's live position.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
