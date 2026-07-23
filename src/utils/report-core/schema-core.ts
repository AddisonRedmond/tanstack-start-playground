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
};

export type ReportTable = {
  id: string;
  name: string;
  columns: ReportColumn[];
  relations: ReportRelation[];
};

export type ReportRelation = {
  table: string;
  field: string;
  type: "one" | "many";
};

const schemaEntries = Object.entries(schema);

const tables = schemaEntries.filter(([, value]) => {
  return value && typeof value === "object" && "getSQL" in value;
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

    return Object.entries(relationConfig).map(([field, relation]) => ({
      table: getTableName((relation as { referencedTable: unknown }).referencedTable as never),
      field,
      type: relation instanceof One ? "one" : "many",
    }));
  });
}

export const reportTables: ReportTable[] = tables.map(([, table]) => {
  const name = getTableName(table as never);
  const columns = getTableColumns(table as never);

  return {
    id: name,
    name,
    columns: Object.entries(columns).map(([key, column]) => ({
      id: `${name}.${key}`,
      name: key,
      dataType: column.dataType ?? "unknown",
    })),
    relations: getRelationsForTable(table),
  };
});
// example report
// {
//   "table": "users",
//   "columns": [
//     "firstName",
//     "lastName",
//     "company.name"
//   ],
//   "filters": [
//     {
//       "field": "company.name",
//       "operator": "contains",
//       "value": "Acme"
//     }
//   ]
// }
