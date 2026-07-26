import { describe, expect, it } from "vitest";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import { buildReportQuery } from "./report-engine";

describe("buildReportQuery", () => {
  it("builds a join plan for nested relations", () => {
    const config: ConfigType = {
      table: "users",
      columns: ["id"],
      relations: {
        user_profiles: ["id", "bio"],
        user_address_data: [
          "userProfileId",
          "street",
          "city",
          "state",
          "postalCode",
          "country",
          "createdAt",
        ],
      },
    };

    const plan = buildReportQuery(config);

    expect(plan.baseTable).toBe("users");
    expect(plan.selectColumns).toContainEqual("users.id");
    expect(plan.selectColumns).toContainEqual("user_profiles.id");
    expect(plan.selectColumns).toContainEqual("user_address_data.street");
    expect(plan.joins).toHaveLength(2);
  });
});
