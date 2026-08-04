import type { FilterOperator } from "#/utils/report-core/types.ts";

type FilterInputProps = {
  title: string;
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

const DropdownOptions: React.FC<{ type: DataTypes }> = ({ type }) => {
  return (
    <select className="w-1/4">
      <option>Dropdown</option>
    </select>
  );
};

export const BuildFilters: React.FC<FilterInputProps> = ({ title }) => {
  return (
    <div>
      <div className="w-full border rounded-md flex">
        <p className="w-1/4">{title}</p>
        <DropdownOptions type={"string"} />
        <input />
      </div>

      {/* text input */}
    </div>
  );
};

export default BuildFilters;
