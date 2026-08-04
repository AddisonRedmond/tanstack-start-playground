import { createFileRoute } from "@tanstack/react-router";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import { buildReportQuery } from "#/utils/report-core/report-engine.ts";

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { config?: ConfigType };
          const config = body?.config;

          if (!config) {
            return new Response(JSON.stringify({ error: "Missing config" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const sql = await buildReportQuery(config);
          return new Response(JSON.stringify(sql), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to run report" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
