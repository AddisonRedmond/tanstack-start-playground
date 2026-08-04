import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/report-tables")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getReportTables } = await import(
            "#/utils/report-core/schema-core.ts"
          );
          const tables = await getReportTables();

          return new Response(JSON.stringify(tables), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to load report table metadata" }),
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
