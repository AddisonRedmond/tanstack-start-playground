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

export type FilterDataType = "string" | "number" | "boolean" | "date";

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "notBetween"
  | "in"
  | "notIn"
  | "isNull"
  | "isNotNull";

export type FilterValuePrimitive = string | number | boolean | null;

export type FilterValue =
  | FilterValuePrimitive
  | FilterValuePrimitive[]
  | [FilterValuePrimitive, FilterValuePrimitive];

export type ReportFilter = {
  id: string;
  table?: string;
  column: string;
  dataType: FilterDataType;
  operator: FilterOperator;
  value?: FilterValue;
};
