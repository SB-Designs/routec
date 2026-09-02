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

const STORAGE_TICKET = "routec:ticketId";
const STORAGE_STOP = "routec:stopId";

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

  // Restore last-used ticket and stop from browser storage.
  useEffect(() => {
    try {
      const savedStop = window.localStorage.getItem(STORAGE_STOP);
      if (savedStop && ALL_STOPS.some((s) => s.id === savedStop)) {
        setStopId(savedStop);
      }
      const savedTicket = window.localStorage.getItem(STORAGE_TICKET);
      if (savedTicket) {
        setTicketInput(savedTicket);
        setTicketId(savedTicket);
        void load(savedTicket);
      }
    } catch {
      // storage unavailable — ignore
    }
  }, [load]);

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
    // Replace the remembered ticket with whatever was just entered.
    try {
      if (res.ok) window.localStorage.setItem(STORAGE_TICKET, id);
      else window.localStorage.removeItem(STORAGE_TICKET);
    } catch {
      // storage unavailable — ignore
    }
  }

  function onStopChange(id: string) {
    setStopId(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_STOP, id);
      else window.localStorage.removeItem(STORAGE_STOP);
    } catch {
      // storage unavailable — ignore
    }
  }

  const live = result?.ok ? result : null;
  const stop = ALL_STOPS.find((s) => s.id === stopId) ?? null;
  const distanceKm = live && stop ? haversineKm(live, stop) : null;
  const eta = distanceKm !== null ? estimate(distanceKm) : null;

  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto w-full max-w-2xl px-5 py-12">
        <header className="mb-8 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-foreground/70">
            route ◦ c
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">
            Live bus tracker
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
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
            className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
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
                  <p className="font-display text-lg font-semibold text-card-foreground">
                    {live.serviceName}
                  </p>
                </div>
                <span className="flex items-center gap-2 text-xs text-accent">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  {live.enabled ? "Live" : "Offline"}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Latitude</dt>
                  <dd className="font-mono text-card-foreground">{live.lat.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Longitude</dt>
                  <dd className="font-mono text-card-foreground">{live.long.toFixed(6)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Last position update</dt>
                  <dd className="text-card-foreground">
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
            <p className="text-xs text-foreground/60">
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
                onChange={(e) => onStopChange(e.target.value)}
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
      <p className="font-display text-base font-semibold text-card-foreground">{stop.name}</p>
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
      <p className="mt-1 font-mono text-lg font-semibold text-card-foreground">{value}</p>
    </div>
  );
}
