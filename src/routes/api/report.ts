import { createFileRoute } from "@tanstack/react-router";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";

export const Route = createFileRoute("/api/report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { config?: ConfigType };
        const config = body?.config;

        if (!config?.table) {
          return new Response(JSON.stringify({ error: "Missing config" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { ReportEngine } = await import(
          "#/utils/report-core/report-engine.ts"
        );

        const result = await ReportEngine(config);

        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
