import type { ConfigType } from "#/components/report-client/report-parent.tsx";
import * as schema from "#/db/schema";
import { db } from "#/db/index.ts";
import { env } from "#/env.ts";
import { getTableColumns, getTableName } from "drizzle-orm";

import { getReportTables } from "./schema-core";

type ReportQueryPlan = {
  sql: string;
  params: unknown[];
};

function quoteIdentifier(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

function quoteTable(tableName: string) {
  return `${quoteIdentifier(env.DB_SCHEMA)}.${quoteIdentifier(tableName)}`;
}

function getTableByName(tableName: string) {
  const matchingEntry = Object.values(schema).find((value) => {
    if (!value || typeof value !== "object") {
      return false;
    }

    return getTableName(value as never) === tableName;
  });

  return matchingEntry as Record<string, unknown> | undefined;
}

function getColumnNames(tableName: string) {
  const table = getTableByName(tableName);

  if (!table) {
    return [];
  }

  return Object.keys(getTableColumns(table as never));
}

function getSqlColumnName(tableName: string, columnName: string) {
  const table = getTableByName(tableName);

  if (!table) {
    return columnName;
  }

  const column = Object.entries(getTableColumns(table as never)).find(
    ([key]) => key === columnName,
  );
  const sqlColumn = column?.[1] as { name?: string } | undefined;

  return sqlColumn?.name ?? columnName;
}

function singularize(tableName: string) {
  const normalized = tableName.replace(/_([a-z])/g, (_, char) =>
    char.toUpperCase(),
  );
  return normalized.replace(/s$/, "");
}

function getJoinColumn(sourceTableName: string, targetTableName: string) {
  const targetColumns = getColumnNames(targetTableName);
  const sourceBase = singularize(sourceTableName);
  const normalizedSourceBase = sourceBase.toLowerCase();
  const candidates = [
    `${sourceBase}Id`,
    `${sourceBase}ID`,
    `${sourceBase.toLowerCase()}Id`,
    `${sourceBase.toLowerCase()}ID`,
    `${sourceBase.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}_id`,
    `${normalizedSourceBase}_id`,
    `${normalizedSourceBase}Id`,
    `${normalizedSourceBase}ID`,
    `${normalizedSourceBase}id`,
    `${normalizedSourceBase}id`,
    "id",
  ];

  return (
    targetColumns.find((columnName) => candidates.includes(columnName)) ?? "id"
  );
}

export const buildReportQuery = async (
  config: ConfigType,
): Promise<ReportQueryPlan> => {
  const reportTables = await getReportTables();
  const baseTable = config.table;

  const seenAliases = new Map<string, number>();
  function uniqueAlias(tableName: string, columnName: string): string {
    const base = `${tableName}__${columnName}`;
    const count = seenAliases.get(base) ?? 0;
    seenAliases.set(base, count + 1);
    return count === 0 ? base : `${base}__${count}`;
  }

  const selectedColumns = config.columns.map((columnName) => {
    const sqlCol = getSqlColumnName(baseTable, columnName);
    const alias = uniqueAlias(baseTable, columnName);
    return `${quoteTable(baseTable)}.${quoteIdentifier(sqlCol)} AS ${quoteIdentifier(alias)}`;
  });

  const relationEntries = Object.entries(config.relations ?? {});
  const joinClauses: string[] = [];
  const seenJoinEdges = new Set<string>();

  for (const [relationTableName] of relationEntries) {
    const relation = reportTables[baseTable]?.relations.find(
      (candidate) => candidate.table === relationTableName,
    );

    if (relation?.joinPath && relation.joinPath.length > 0) {
      for (const step of relation.joinPath) {
        const joinKey = `${step.fromTable}:${step.fromColumn}:${step.toTable}:${step.toColumn}`;

        if (seenJoinEdges.has(joinKey)) {
          continue;
        }

        seenJoinEdges.add(joinKey);
        joinClauses.push(
          `LEFT JOIN ${quoteTable(step.toTable)} ON ${quoteTable(step.fromTable)}.${quoteIdentifier(step.fromColumn)} = ${quoteTable(step.toTable)}.${quoteIdentifier(step.toColumn)}`,
        );
      }

      continue;
    }

    const path = relation?.path ?? [baseTable, relationTableName];
    const steps = path.slice(1);

    for (const step of steps) {
      const previousTable = path[path.indexOf(step) - 1] ?? baseTable;
      const joinColumn = getJoinColumn(previousTable, step);
      const sourceColumn = "id";
      const joinKey = `${previousTable}:${sourceColumn}:${step}:${joinColumn}`;

      if (seenJoinEdges.has(joinKey)) {
        continue;
      }

      seenJoinEdges.add(joinKey);
      joinClauses.push(
        `LEFT JOIN ${quoteTable(step)} ON ${quoteTable(previousTable)}.${quoteIdentifier(sourceColumn)} = ${quoteTable(step)}.${quoteIdentifier(joinColumn)}`,
      );
    }
  }

  for (const [relationTableName, relationColumns] of relationEntries) {
    selectedColumns.push(
      ...relationColumns.map((columnName) => {
        const sqlCol = getSqlColumnName(relationTableName, columnName);
        const alias = uniqueAlias(relationTableName, columnName);
        return `${quoteTable(relationTableName)}.${quoteIdentifier(sqlCol)} AS ${quoteIdentifier(alias)}`;
      }),
    );
  }

  const sql = [
    `SELECT ${selectedColumns.join(", ")}`,
    `FROM ${quoteTable(baseTable)}`,
    ...joinClauses,
  ].join("\n");

  return { sql, params: [] };
};

export const ReportEngine = async (config: ConfigType) => {
  const plan = await buildReportQuery(config);
  const result = await db.execute(plan.sql);
  return result.rows;
};
