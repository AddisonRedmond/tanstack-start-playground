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
            targetColumn: "userId",
            type: "many",
            path: ["users", "user_profiles"],
            joinPath: [
              {
                fromTable: "users",
                fromColumn: "id",
                toTable: "user_profiles",
                toColumn: "userId",
              },
            ],
          },
          {
            table: "user_address_data",
            field: "id",
            sourceColumn: "id",
            targetColumn: "userId",
            type: "many",
            path: ["users", "user_profiles", "user_address_data"],
            joinPath: [
              {
                fromTable: "users",
                fromColumn: "id",
                toTable: "user_profiles",
                toColumn: "userId",
              },
              {
                fromTable: "user_profiles",
                fromColumn: "id",
                toTable: "user_address_data",
                toColumn: "userProfileId",
              },
            ],
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
      columns: [{ name: "id", dataType: "uuid" }],
      relations: {
        user_profiles: [
          { name: "id", dataType: "uuid" },
          { name: "bio", dataType: "text" },
        ],
        user_address_data: [
          { name: "userProfileId", dataType: "uuid" },
          { name: "street", dataType: "text" },
          { name: "city", dataType: "text" },
          { name: "state", dataType: "text" },
          { name: "postalCode", dataType: "text" },
          { name: "country", dataType: "text" },
          { name: "createdAt", dataType: "timestamp" },
        ],
      },
    };

    const plan = await buildReportQuery(config);

    expect(plan.sql).toContain('FROM "users"');
    expect(plan.sql).toContain(
      'LEFT JOIN "user_profiles" ON "users"."id" = "user_profiles"."userId"',
    );
    expect(plan.sql).toContain(
      'LEFT JOIN "user_address_data" ON "user_profiles"."id" = "user_address_data"."userProfileId"',
    );
    expect(plan.sql).toContain('"users"."id"');
    expect(plan.sql).toContain('"user_profiles"."id"');
    expect(plan.sql).toContain('"user_address_data"."street"');
  });
});
