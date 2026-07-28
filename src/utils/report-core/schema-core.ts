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

  const result: ReportTablesByName = {};

  for (const table of tables) {
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

      relations: metadata
        .filter(
          (column) => column.table_name === table && column.is_foreign_key,
        )
        .map((column) => ({
          table: column.foreign_table_name!,
          field: column.column_name,
          sourceColumn: column.column_name,
          targetColumn: column.foreign_column_name!,
          type: "one" as const,
        })),
    };
  }

  return result;
}
