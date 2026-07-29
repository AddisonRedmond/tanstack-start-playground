import { db } from "#/db/index.ts";
import type { ReportRelation, ReportTablesByName } from "./types";

type DatabaseColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
};

type GraphEdge = {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: "one" | "many";
};

function buildRelationGraph(metadata: DatabaseColumnRow[]) {
  const adjacency: Record<string, GraphEdge[]> = {};

  const addEdge = (edge: GraphEdge) => {
    if (!adjacency[edge.fromTable]) {
      adjacency[edge.fromTable] = [];
    }

    adjacency[edge.fromTable].push(edge);
  };

  metadata
    .filter((column) => column.is_foreign_key)
    .forEach((column) => {
      if (!column.foreign_table_name || !column.foreign_column_name) {
        return;
      }

      // Child table points to parent table by FK.
      addEdge({
        fromTable: column.table_name,
        fromColumn: column.column_name,
        toTable: column.foreign_table_name,
        toColumn: column.foreign_column_name,
        type: "one",
      });

      // Reverse edge lets us traverse from parent to related children.
      addEdge({
        fromTable: column.foreign_table_name,
        fromColumn: column.foreign_column_name,
        toTable: column.table_name,
        toColumn: column.column_name,
        type: "many",
      });
    });

  return adjacency;
}

function getShortestPath(
  graph: Record<string, GraphEdge[]>,
  start: string,
  target: string,
): GraphEdge[] | null {
  if (start === target) {
    return [];
  }

  const visited = new Set<string>([start]);
  const queue: Array<{ table: string; path: GraphEdge[] }> = [
    { table: start, path: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const nextEdges = graph[current.table] ?? [];

    for (const edge of nextEdges) {
      if (visited.has(edge.toTable)) {
        continue;
      }

      const nextPath = [...current.path, edge];

      if (edge.toTable === target) {
        return nextPath;
      }

      visited.add(edge.toTable);
      queue.push({ table: edge.toTable, path: nextPath });
    }
  }

  return null;
}

async function getMetadata(): Promise<DatabaseColumnRow[]> {
  const result = await db.execute(`
    SELECT
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable = 'YES' AS is_nullable,

      EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = c.table_name
          AND kcu.column_name = c.column_name
      ) AS is_primary_key,

      fk.foreign_table_name IS NOT NULL AS is_foreign_key,
      fk.foreign_table_name,
      fk.foreign_column_name

    FROM information_schema.columns c

    LEFT JOIN (
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc

      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name

      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name

      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    ) fk
      ON fk.table_name = c.table_name
      AND fk.column_name = c.column_name

    WHERE c.table_schema = 'public'

    ORDER BY c.table_name, c.ordinal_position;
  `);

  return result.rows as DatabaseColumnRow[];
}

export async function getAllTables() {
  const metadata = await getMetadata();

  return [...new Set(metadata.map((column) => column.table_name))];
}

export async function getAllColumns(tableName?: string) {
  const metadata = await getMetadata();

  return metadata
    .filter((column) => (tableName ? column.table_name === tableName : true))
    .map((column) => ({
      id: `${column.table_name}.${column.column_name}`,
      name: column.column_name,
      dataType: column.data_type,
      isPrimaryKey: column.is_primary_key,
      isForeignKey: column.is_foreign_key,
    }));
}

export async function getRelations(
  tableName: string,
): Promise<ReportRelation[]> {
  const metadata = await getMetadata();

  return metadata
    .filter(
      (column) => column.table_name === tableName && column.is_foreign_key,
    )
    .map((column) => ({
      table: column.foreign_table_name!,
      field: column.column_name,
      sourceColumn: column.column_name,
      targetColumn: column.foreign_column_name!,
      type: "one",
    }));
}

export async function getReportTables(): Promise<ReportTablesByName> {
  const metadata = await getMetadata();

  const tables = [...new Set(metadata.map((column) => column.table_name))];
  const relationGraph = buildRelationGraph(metadata);

  const result: ReportTablesByName = {};

  for (const table of tables) {
    const reachableRelations: ReportRelation[] = [];

    for (const targetTable of tables) {
      if (targetTable === table) {
        continue;
      }

      const pathEdges = getShortestPath(relationGraph, table, targetTable);

      if (!pathEdges || pathEdges.length === 0) {
        continue;
      }

      const firstEdge = pathEdges[0];

      reachableRelations.push({
        table: targetTable,
        field: firstEdge.fromColumn,
        sourceColumn: firstEdge.fromColumn,
        targetColumn: firstEdge.toColumn,
        type: firstEdge.type,
        path: [table, ...pathEdges.map((edge) => edge.toTable)],
        joinPath: pathEdges.map((edge) => ({
          fromTable: edge.fromTable,
          fromColumn: edge.fromColumn,
          toTable: edge.toTable,
          toColumn: edge.toColumn,
        })),
      });
    }

    result[table] = {
      columns: metadata
        .filter((column) => column.table_name === table)
        .map((column) => ({
          id: `${table}.${column.column_name}`,
          name: column.column_name,
          dataType: column.data_type,
          isPrimaryKey: column.is_primary_key,
          isForeignKey: column.is_foreign_key,
        })),

      relations: reachableRelations,
    };
  }

  return result;
}
