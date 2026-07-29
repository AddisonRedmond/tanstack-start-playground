export type ReportColumn = {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
};

export type ReportRelation = {
  table: string;
  field: string;
  sourceColumn: string;
  targetColumn: string;
  type: "one" | "many";
  path?: string[];
  joinPath?: Array<{
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
  }>;
};

export type ReportTable = {
  id: string;
  name: string;
  columns: ReportColumn[];
  relations: ReportRelation[];
};

export type ReportTablesByName = Record<
  string,
  Omit<ReportTable, "id" | "name">
>;
