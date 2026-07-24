import { useMemo, useState } from "react";
import {
  reportTables,
  type ReportColumn,
  type ReportRelation,
} from "#/utils/report-core/schema-core.ts";
import { Key, Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type ColumnSelectProps = {
  selectedTable: string;
};

type ColumnSectionProps = {
  columns: ReportColumn[];
  selectedColumns: Set<string>;
  onToggleColumn: (columnId: string, relationField?: string) => void;
};

const ColumnSection: React.FC<ColumnSectionProps> = ({
  columns,
  selectedColumns,
  onToggleColumn,
}) => {
  return (
    <div className="w-full border-b">
      {columns.map((col) => {
        const isSelected = selectedColumns.has(col.id);

        return (
          <div key={col.id} className="flex justify-between px-2 my-2">
            <div className="space-x-2 flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleColumn(col.id)}
              />
              <label>{col.name}</label>
            </div>
            <div className="flex gap-x-1">
              {col.isPrimaryKey && (
                <Key width={15} className="text-yellow-500" />
              )}
              {col.isForeignKey && <Link width={15} />}
              <p className="text-xs px-1 grid place-content-center rounded-sm text-white bg-stone-400">
                {col.dataType}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

type RelatedTablesProps = {
  relations: ReportRelation[];
  selectedColumns: Set<string>;
  onToggleColumn: (columnId: string, relationField?: string) => void;
};

const RelatedTables: React.FC<RelatedTablesProps> = ({
  relations,
  selectedColumns,
  onToggleColumn,
}) => {
  if (!relations.length) {
    return null;
  }

  return (
    <div className="w-full border-b py-2">
      {relations.map((relation) => {
        const relatedTable = reportTables[relation.table];
        if (!relatedTable) {
          return null;
        }

        return (
          <div
            key={`${relation.table}-${relation.field}`}
            className="px-2 py-2"
          >
            <div className="flex justify-between items-center text-sm font-medium mb-2">
              <div className="flex gap-x-2">
                <Link width={20} />
                <p>{relation.table}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <p className="text-xs text-stone-500">{relation.field}</p>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                  {relation.sourceColumn} → {relation.targetColumn}
                </span>
              </div>
            </div>
            <div>
              {relatedTable.columns.map((col) => {
                const columnId = `${relation.table}.${col.name}`;

                return (
                  <div
                    key={columnId}
                    className="flex justify-between px-2 py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-x-2">
                      <Checkbox />
                      <label className="text-sm">{col.name}</label>
                    </div>
                    <p className="text-xs px-1 rounded-sm text-white bg-stone-400">
                      {col.dataType}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ColumnSelect: React.FC<ColumnSelectProps> = ({ selectedTable }) => {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(),
  );

  const columns = useMemo(
    () => reportTables[selectedTable]?.columns ?? [],
    [selectedTable],
  );
  const relatedTables = useMemo(
    () => reportTables[selectedTable]?.relations ?? [],
    [selectedTable],
  );

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      const isSelecting = !next.has(columnId);

      if (isSelecting) {
        next.add(columnId);
      } else {
        next.delete(columnId);

        if (columnId.startsWith(`${selectedTable}.`)) {
          Array.from(next).forEach((selectedId) => {
            if (selectedId.includes(".")) {
              next.delete(selectedId);
            }
          });
        }
      }

      return next;
    });
  };

  const handleToggleRelatedColumn = (
    columnId: string,
    relationField?: string,
  ) => {};

  return (
    <div>
      <div className="h-12 border-b font-medium text-sm pl-2 flex justify-between items-center px-2">
        <div className="flex">
          <p>COLUMNS</p>
          {selectedTable && (
            <p className="ml-2 px-2 text-xs py-0.5 bg-stone-700 rounded-full text-white">
              {selectedTable}
            </p>
          )}
        </div>

        <button className="text-xs ease-in-out duration-200 hover:text-stone-500 cursor-pointer">
          {columns.length > 0 ? `Select all (${columns.length})` : "Select all"}
        </button>
      </div>
      <ColumnSection
        columns={columns}
        selectedColumns={selectedColumns}
        onToggleColumn={handleToggleColumn}
      />
      {relatedTables.length > 0 && (
        <>
          <div className="h-12 border-b font-medium text-sm pl-2 flex items-center px-2">
            RELATED TABLES
          </div>
          <RelatedTables
            relations={relatedTables}
            selectedColumns={selectedColumns}
            onToggleColumn={handleToggleRelatedColumn}
          />
        </>
      )}
    </div>
  );
};

export default ColumnSelect;
