import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db/index.ts";
import * as schema from "@/db/schema";

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      GET: async () => {
        console.log(schema.todos);
        return new Response(JSON.stringify({ key: "value" }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
