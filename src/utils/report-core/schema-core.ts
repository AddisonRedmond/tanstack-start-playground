import * as schema from "@/db/schema";

import {
  createTableRelationsHelpers,
  getTableColumns,
  getTableName,
  One,
} from "drizzle-orm";

export type ReportColumn = {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
};

export type ReportTable = {
  id: string;
  name: string;
  columns: ReportColumn[];
  relations: ReportRelation[];
};

export type ReportTablesByName = Record<string, Omit<ReportTable, "id" | "name">>;

export type ReportRelation = {
  table: string;
  field: string;
  type: "one" | "many";
};

const schemaEntries = Object.entries(schema);

const tables = [...schemaEntries.filter(([, value]) => {
  return value && typeof value === "object" && "getSQL" in value;
})].sort(([, leftValue], [, rightValue]) => {
  const leftName = getTableName(leftValue as never);
  const rightName = getTableName(rightValue as never);

  return String(leftName).localeCompare(String(rightName));
});

const relationEntries = schemaEntries.filter(([, value]) => {
  return (
    value &&
    typeof value === "object" &&
    "config" in value &&
    typeof value.config === "function"
  );
});

function isRelationDefinition(value: unknown): value is {
  table: unknown;
  config: (
    helpers: ReturnType<typeof createTableRelationsHelpers>,
  ) => Record<string, unknown>;
} {
  return Boolean(
    value &&
    typeof value === "object" &&
    "config" in value &&
    typeof (value as { config?: unknown }).config === "function",
  );
}

function getRelationsForTable(table: (typeof tables)[number][1]) {
  const sourceTableName = getTableName(table as never);

  return relationEntries.flatMap(([, relationValue]) => {
    if (!isRelationDefinition(relationValue)) {
      return [];
    }

    const relationTableName = getTableName(relationValue.table as never);

    if (relationTableName !== sourceTableName) {
      return [];
    }

    const helpers = createTableRelationsHelpers(table as never);
    const relationConfig = relationValue.config(helpers);

    return Object.entries(relationConfig).flatMap(([field, relation]) => {
      if (!(relation instanceof One)) {
        return [];
      }

      return [
        {
          table: getTableName(
            (relation as { referencedTable: unknown }).referencedTable as never,
          ),
          field,
          type: "one" as const,
        },
      ];
    });
  });
}

export const reportTables: ReportTablesByName = Object.fromEntries(
  tables.map(([, table]) => {
    const name = getTableName(table as never);
    const columns = getTableColumns(table as never) as Record<
      string,
      {
        dataType?: string | undefined;
        primary?: boolean;
        name?: string;
        references?: unknown;
      }
    >;

    const foreignKeyColumnNames = new Set<string>(
      relationEntries.flatMap(([, relationValue]) => {
        if (!isRelationDefinition(relationValue)) {
          return [];
        }

        const relationTableName = getTableName(relationValue.table as never);
        if (relationTableName !== name) {
          return [];
        }

        const helpers = createTableRelationsHelpers(table as never);
        const relationConfig = relationValue.config(helpers);

        return Object.entries(relationConfig).flatMap(([field, relation]) => {
          if (!(relation instanceof One)) {
            return [];
          }

          return [field];
        });
      }),
    );

    return [
      name,
      {
        columns: Object.entries(columns).map(([key, column]) => ({
          id: `${name}.${key}`,
          name: key,
          dataType: column.dataType ?? "unknown",
          isPrimaryKey: Boolean(column.primary),
          isForeignKey: foreignKeyColumnNames.has(key),
        })),
        relations: getRelationsForTable(table),
      },
    ];
  }),
);
