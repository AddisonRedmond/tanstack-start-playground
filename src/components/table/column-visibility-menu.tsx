import type { Table } from "@tanstack/react-table";
import { Checkbox } from "#/components/ui/checkbox.tsx";

type ColumnVisibilityMenuProps<TData extends Record<string, unknown>> = {
  table: Table<TData>;
};

function formatColumnLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ColumnVisibilityMenu<TData extends Record<string, unknown>>({
  table,
}: ColumnVisibilityMenuProps<TData>) {
  const columns = table.getAllLeafColumns();

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm hover:bg-stone-100">
        Columns
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-stone-200 bg-white p-2 shadow-lg">
        <div className="max-h-72 overflow-auto pr-1">
          {columns.map((column) => (
            <label
              key={column.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              <span className="truncate">{formatColumnLabel(column.id)}</span>
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => {
                  column.toggleVisibility(Boolean(checked));
                }}
                className="shrink-0"
              />
            </label>
          ))}
        </div>
      </div>
    </details>
  );
}
