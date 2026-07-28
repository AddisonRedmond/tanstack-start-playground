import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import { buildReportQuery } from "./report-engine";

vi.mock("./schema-core", () => ({
  getReportTables: vi.fn(),
}));

import { getReportTables } from "./schema-core";

const mockedGetReportTables = vi.mocked(getReportTables);

describe("buildReportQuery", () => {
  beforeEach(() => {
    mockedGetReportTables.mockReset();
  });

  it("builds a join plan for nested relations", async () => {
    mockedGetReportTables.mockResolvedValue({
      users: {
        columns: [
          {
            id: "users.id",
            name: "id",
            dataType: "uuid",
            isPrimaryKey: true,
            isForeignKey: false,
          },
        ],
        relations: [
          {
            table: "user_profiles",
            field: "id",
            sourceColumn: "id",
            targetColumn: "id",
            type: "one",
            path: ["users", "user_profiles"],
          },
          {
            table: "user_address_data",
            field: "userProfileId",
            sourceColumn: "id",
            targetColumn: "userProfileId",
            type: "one",
            path: ["users", "user_profiles", "user_address_data"],
          },
        ],
      },
      user_profiles: {
        columns: [
          {
            id: "user_profiles.id",
            name: "id",
            dataType: "uuid",
            isPrimaryKey: true,
            isForeignKey: false,
          },
        ],
        relations: [],
      },
      user_address_data: {
        columns: [
          {
            id: "user_address_data.userProfileId",
            name: "userProfileId",
            dataType: "uuid",
            isPrimaryKey: false,
            isForeignKey: true,
          },
          {
            id: "user_address_data.street",
            name: "street",
            dataType: "text",
            isPrimaryKey: false,
            isForeignKey: false,
          },
        ],
        relations: [],
      },
    });

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

    const plan = await buildReportQuery(config);

    expect(plan.sql).toContain('FROM "users"');
    expect(plan.sql).toContain('LEFT JOIN "user_profiles"');
    expect(plan.sql).toContain('LEFT JOIN "user_address_data"');
    expect(plan.sql).toContain('"users"."id"');
    expect(plan.sql).toContain('"user_profiles"."id"');
    expect(plan.sql).toContain('"user_address_data"."street"');
  });
});
