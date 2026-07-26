import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db/index.ts";
import * as schema from "@/db/schema";
import { ReportEngine } from "#/utils/report-core/report-engine.ts";

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
        const test = await ReportEngine(jsonTest);
        return new Response(JSON.stringify(test), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
