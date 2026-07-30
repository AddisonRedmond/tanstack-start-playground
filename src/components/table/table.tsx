import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnResizeMode,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import ColumnVisibilityMenu from "#/components/table/column-visibility-menu.tsx";
import { cn } from "#/lib/utils.ts";

type GenericTableProps<TData extends Record<string, unknown>> = {
  data: TData[];
  className?: string;
  emptyMessage?: string;
};

function formatHeader(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export default function GenericTable<TData extends Record<string, unknown>>({
  data,
  className,
  emptyMessage = "No data available.",
}: GenericTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (data.length === 0) {
      return [];
    }

    const firstRow = data[0];

    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: formatHeader(key),
      cell: ({ getValue }) => formatCellValue(getValue()),
      size: 180,
      minSize: 80,
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      if (!search) {
        return true;
      }

      return Object.values(row.original).some((value) => {
        if (value === null || value === undefined) {
          return false;
        }

        return String(value).toLowerCase().includes(search);
      });
    },
    columnResizeMode,
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 41,
    overscan: 20,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-[80vh] min-h-0 flex-col rounded-lg border border-stone-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search rows"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-stone-500 focus:outline-none sm:max-w-xs"
        />
        <div className=" flex flex-col justify-center">
          <p className="text-xs text-stone-500 whitespace-nowrap text-center">
            {rows.length === data.length
              ? `${data.length.toLocaleString()} rows`
              : `${rows.length.toLocaleString()} of ${data.length.toLocaleString()} rows`}
          </p>
          <ColumnVisibilityMenu table={table} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto" ref={scrollRef}>
        <table
          className="divide-y divide-stone-200"
          style={{
            width: table.getCenterTotalSize(),
            tableLayout: "fixed",
          }}
        >
          <thead className="sticky top-0 z-10 bg-stone-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative border-r border-stone-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-700 last:border-r-0 overflow-hidden"
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="truncate" title={typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : undefined}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </span>
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="rounded border border-stone-300 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 transition hover:bg-stone-100"
                          aria-label={`Sort by ${String(header.column.columnDef.header ?? header.column.id)}`}
                        >
                          {header.column.getIsSorted() === "asc"
                            ? "↑"
                            : header.column.getIsSorted() === "desc"
                              ? "↓"
                              : "↕"}
                        </button>
                      ) : null}
                    </div>
                    {header.column.getCanResize() ? (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none"
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <tr key={row.id} className="hover:bg-stone-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 text-sm text-stone-700"
                      title={formatCellValue(cell.getValue())}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
