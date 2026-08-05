import type { FilterOperator } from "#/utils/report-core/types.ts";
import type { ConfigType } from "./report-parent";

type FilterInputProps = {
  title: string;
  config: ConfigType;
};

type OperatorOption = {
  label: string;
  value: FilterOperator;
};

export const filterOptions = {
  int: [
    { label: "Equals", value: "equals" },
    { label: "Does not equal", value: "notEquals" },
    { label: "Greater than", value: "gt" },
    { label: "Greater than or equal", value: "gte" },
    { label: "Less than", value: "lt" },
    { label: "Less than or equal", value: "lte" },
    { label: "Is between", value: "between" },
    { label: "Is not between", value: "notBetween" },
    { label: "Is in list", value: "in" },
    { label: "Is not in list", value: "notIn" },
    { label: "Is null", value: "isNull" },
    { label: "Is not null", value: "isNotNull" },
  ],
  string: [
    { label: "Equals", value: "equals" },
    { label: "Does not equal", value: "notEquals" },
    { label: "Contains", value: "contains" },
    { label: "Does not contain", value: "notContains" },
    { label: "Starts with", value: "startsWith" },
    { label: "Ends with", value: "endsWith" },
    { label: "Is in list", value: "in" },
    { label: "Is not in list", value: "notIn" },
    { label: "Is null", value: "isNull" },
    { label: "Is not null", value: "isNotNull" },
  ],
  dateTime: [
    { label: "Equals", value: "equals" },
    { label: "Does not equal", value: "notEquals" },
    { label: "After", value: "gt" },
    { label: "On or after", value: "gte" },
    { label: "Before", value: "lt" },
    { label: "On or before", value: "lte" },
    { label: "Is between", value: "between" },
    { label: "Is not between", value: "notBetween" },
    { label: "Is null", value: "isNull" },
    { label: "Is not null", value: "isNotNull" },
  ],
  boolean: [
    { label: "Equals", value: "equals" },
    { label: "Does not equal", value: "notEquals" },
    { label: "Is null", value: "isNull" },
    { label: "Is not null", value: "isNotNull" },
  ],
} satisfies Record<"int" | "string" | "dateTime" | "boolean", OperatorOption[]>;

type DataTypes = keyof typeof filterOptions;

const normalizeDataType = (dataType: string): DataTypes => {
  if (dataType.includes("int") || dataType === "number") {
    return "int";
  }

  if (dataType.includes("bool")) {
    return "boolean";
  }

  if (dataType.includes("date") || dataType.includes("time")) {
    return "dateTime";
  }

  return "string";
};

const DropdownOptions: React.FC<{ type: DataTypes }> = ({ type }) => {
  return (
    <select className="w-1/4">
      {filterOptions[type].map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const BuildFilters: React.FC<FilterInputProps> = ({ title, config }) => {
  const baseFilterRows = config.columns.map((column) => ({
    id: `column-${column.name}`,
    label: column.name,
    dataType: normalizeDataType(column.dataType),
  }));

  const relationSections = Object.entries(config.relations).map(
    ([relationName, relationColumns]) => ({
      relationName,
      rows: relationColumns.map((column) => ({
        id: `${relationName}-${column.name}`,
        label: column.name,
        dataType: normalizeDataType(column.dataType),
      })),
    }),
  );

  return (
    <div className="max-h-[85vh] space-y-4 overflow-y-auto pr-2">
      <p className="text-lg font-medium text-stone-700 ">{title}</p>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-800">Base columns</p>
        {baseFilterRows.map((row) => (
          <div
            key={row.id}
            className="flex w-full items-center rounded-md border border-stone-200 p-2"
          >
            <p className="w-24 rounded-md font-medium text-wrap text-stone-700 text-sm">
              {row.label}
            </p>
            <DropdownOptions type={row.dataType} />
            <input className="ml-2 flex-1 rounded-md border border-stone-200 px-2 py-1" />
          </div>
        ))}
      </div>

      {relationSections.map((section) => (
        <div key={section.relationName} className="space-y-2">
          <p className="text-sm font-semibold text-stone-800">
            {section.relationName}
          </p>
          {section.rows.map((row) => (
            <div
              key={row.id}
              className="flex  items-center w-full rounded-md border border-stone-200 p-2"
            >
              <p className="w-24 rounded-md font-medium text-wrap text-stone-700 text-sm">
                {row.label}
              </p>
              <DropdownOptions type={row.dataType} />
              <input className="ml-2 flex-1 rounded-md border border-stone-200 px-2 py-1" />
            </div>
          ))}
        </div>
      ))}
      <div>
        <button className="w-full cursor-pointer rounded-lg border border-stone-300 bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700">
          Run Report
        </button>
      </div>
    </div>
  );
};

export default BuildFilters;
