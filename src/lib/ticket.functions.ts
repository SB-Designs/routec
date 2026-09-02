import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WORKER_BASE = "https://ticket.sbdesigns.workers.dev/customer-ticket";

export type TicketResult =
  | { ok: true; serviceName: string; lat: number; long: number; lastUpdated: string | null; enabled: boolean }
  | { ok: false; error: string };

export const getTicket = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ ticketId: z.string().trim().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data }): Promise<TicketResult> => {
    let res: Response;
    try {
      res = await fetch(`${WORKER_BASE}/${encodeURIComponent(data.ticketId)}`, {
        headers: { Accept: "application/json" },
      });
    } catch {
      return { ok: false, error: "Could not reach the tracking service. Please try again." };
    }

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, error: "Unexpected response from the tracking service." };
    }

    if (!res.ok || json?.error) {
      return { ok: false, error: typeof json?.error === "string" ? json.error : "Ticket not found." };
    }

    const serviceName: string = json.service_name ?? "";
    if (serviceName !== "Route C") {
      return {
        ok: false,
        error: `This ticket is for ${serviceName || "another service"}. Only Route C is available here.`,
      };
    }

    const lat = Number(json.lat);
    const long = Number(json.long);
    if (!Number.isFinite(lat) || !Number.isFinite(long)) {
      return { ok: false, error: "No live position available for this service yet." };
    }

    return {
      ok: true,
      serviceName,
      lat,
      long,
      lastUpdated: typeof json.last_updated === "string" ? json.last_updated : null,
      enabled: Boolean(json.enabled),
    };
  });
