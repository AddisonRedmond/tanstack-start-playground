import { createFileRoute } from "@tanstack/react-router";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";

const jsonTest = {
  table: "user_profiles",
  columns: ["userId", "avatarUrl"],
  relations: {
    users: ["id", "name", "email", "createdAt"],
  },
};

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      GET: async () => {
        const { ReportEngine } = await import(
          "#/utils/report-core/report-engine.ts"
        );
        const test = await ReportEngine(jsonTest);
        return new Response(JSON.stringify(test), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        try {
          const { ReportEngine } = await import(
            "#/utils/report-core/report-engine.ts"
          );
          const body = (await request.json()) as { config?: ConfigType };
          const config = body?.config;

          if (!config) {
            return new Response(JSON.stringify({ error: "Missing config" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const result = await ReportEngine(config);
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ error: "Failed to run report" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
