import { useEffect, useMemo, useRef, useState } from "react";
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
};

const ColumnSection: React.FC<ColumnSectionProps> = ({ columns }) => {
  return (
    <div className="w-full border-b">
      {columns.map((col) => {
        return (
          <div key={col.id} className="flex justify-between px-2 my-2">
            <div className="space-x-2 flex items-center">
              <Checkbox />
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
};

const RelatedTables: React.FC<RelatedTablesProps> = ({ relations }) => {
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
                      <Checkbox
                        data-table={relation.table}
                        data-column={columnId}
                      />
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
  const columns = useMemo(
    () => reportTables[selectedTable]?.columns ?? [],
    [selectedTable],
  );
  const relatedTables = useMemo(
    () => reportTables[selectedTable]?.relations ?? [],
    [selectedTable],
  );

  const [config, setConfig] = useState({})

  const handleToggleMain = () => {
    
  }

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
      <div>
        <ColumnSection columns={columns} />
        {relatedTables.length > 0 && (
          <>
            <div className="h-12 border-b font-medium text-sm pl-2 flex items-center px-2">
              RELATED TABLES
            </div>
            <RelatedTables relations={relatedTables} />
          </>
        )}
      </div>
    </div>
  );
};

export default ColumnSelect;
