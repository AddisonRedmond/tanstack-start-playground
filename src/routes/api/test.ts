import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db/index.ts";
import * as schema from "@/db/schema";
import { reportTables, relations } from "#/utils/report-core/schema-core";

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      GET: async () => {
        // console.log(reportTables);
        return new Response(JSON.stringify({ reportTables, ...relations }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
